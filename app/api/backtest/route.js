import { spawn } from 'child_process';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Temporary directory for custom strategy files
const TEMP_DIR = path.join(process.cwd(), 'tmp');

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.access(TEMP_DIR);
  } catch (error) {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
}

// Helper function to run a Python script with arguments
async function runPythonScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn('python', [scriptPath, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Python script output: ${error.message}`));
      }
    });
    
    process.on('error', (error) => {
      reject(new Error(`Failed to execute Python script: ${error.message}`));
    });
  });
}

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { dataset, timeframe, strategy, params, initial_capital, custom_code } = body;
    
    // Validate required fields
    if (!dataset) {
      return NextResponse.json({ error: 'Dataset is required' }, { status: 400 });
    }
    
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy is required' }, { status: 400 });
    }
    
    // Handle custom strategy
    let strategyPath = null;
    if (strategy === 'custom' && custom_code) {
      await ensureTempDir();
      
      // Generate a unique filename
      const uniqueId = uuidv4();
      strategyPath = path.join(TEMP_DIR, `custom_strategy_${uniqueId}.py`);
      
      // Write custom strategy to a temporary file
      await fs.writeFile(strategyPath, custom_code);
    }
    
    // Prepare arguments for the Python script
    const datasetPath = path.join(process.cwd(), 'public/data', dataset);
    const backendScriptPath = path.join(process.cwd(), 'lib/backtest_runner.py');
    
    const args = [
      '--dataset', datasetPath,
      '--strategy', strategy,
      '--params', JSON.stringify(params || {}),
    ];
    
    if (timeframe) {
      args.push('--timeframe', timeframe);
    }
    
    if (initial_capital) {
      args.push('--initial_capital', initial_capital.toString());
    }
    
    if (strategyPath) {
      args.push('--custom_strategy_path', strategyPath);
    }
    
    // Run the backtest
    const results = await runPythonScript(backendScriptPath, args);
    
    // Clean up temporary files
    if (strategyPath) {
      try {
        await fs.unlink(strategyPath);
      } catch (error) {
        console.error('Failed to delete temporary strategy file:', error);
      }
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Backtest API error:', error);
    return NextResponse.json(
      { error: 'Failed to run backtest', message: error.message },
      { status: 500 }
    );
  }
}