#!/usr/bin/env python3
"""
Backtest Runner Script

This script serves as the bridge between the Next.js API and the Python backtest engine.
It takes command-line arguments for strategy configuration and returns JSON results.
"""

import argparse
import json
import sys
import os
import importlib.util
import pandas as pd
from typing import Dict, Any, Callable

# Import the backtest engine
# Assuming the backtester module is in the same directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backtest_engine import BacktestEngine, StrategyLibrary, load_data_from_csv


def load_custom_strategy(file_path: str) -> Callable:
    """
    Dynamically load a custom strategy function from a Python file.
    
    Args:
        file_path: Path to the Python file containing the custom strategy
        
    Returns:
        The custom strategy function
    """
    # Get the absolute path
    file_path = os.path.abspath(file_path)
    
    # Generate a module name from the file path
    module_name = os.path.basename(file_path).replace('.py', '')
    
    # Create a spec for the module
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Could not load module from {file_path}")
    
    # Create the module from the spec
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    
    # Check if the module has the custom_strategy function
    if not hasattr(module, 'custom_strategy'):
        raise AttributeError(f"Module {module_name} does not have a 'custom_strategy' function")
    
    # Return the custom strategy function
    return module.custom_strategy


def parse_arguments():
    """
    Parse command-line arguments for the backtest runner.
    
    Returns:
        Parsed arguments
    """
    parser = argparse.ArgumentParser(description='Run a cryptocurrency trading strategy backtest')
    
    parser.add_argument('--dataset', required=True, help='Path to the OHLCV dataset CSV file')
    parser.add_argument('--strategy', required=True, help='Name of the strategy to run')
    parser.add_argument('--params', default='{}', help='JSON string with strategy parameters')
    parser.add_argument('--timeframe', help='Timeframe for the backtest (e.g., 15m, 1h, 4h)')
    parser.add_argument('--initial_capital', type=float, default=10000, help='Initial capital for the backtest')
    parser.add_argument('--custom_strategy_path', help='Path to a Python file with a custom strategy')
    
    return parser.parse_args()


def run_backtest(args):
    """
    Run a backtest with the specified configuration.
    
    Args:
        args: Parsed command-line arguments
        
    Returns:
        Dictionary with backtest results
    """
    # Load data
    try:
        data = load_data_from_csv(args.dataset)
    except Exception as e:
        raise ValueError(f"Failed to load dataset: {str(e)}")
    
    # Parse strategy parameters
    try:
        params = json.loads(args.params)
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON in strategy parameters")
    
    # Initialize backtester
    backtester = BacktestEngine(data, initial_capital=args.initial_capital)
    
    # Get strategy function
    if args.strategy == 'custom' and args.custom_strategy_path:
        try:
            strategy_func = load_custom_strategy(args.custom_strategy_path)
        except Exception as e:
            raise ValueError(f"Failed to load custom strategy: {str(e)}")
    else:
        # Get predefined strategy
        strategy_map = {
            'sma_crossover': StrategyLibrary.simple_moving_average_crossover,
            'rsi': StrategyLibrary.rsi_strategy,
            'bollinger_bands': StrategyLibrary.bollinger_bands_strategy,
            'macd': StrategyLibrary.macd_strategy
        }
        
        if args.strategy not in strategy_map:
            raise ValueError(f"Strategy '{args.strategy}' not found")
        
        strategy_func = strategy_map[args.strategy]
    
    # Run backtest
    results = backtester.run_strategy(strategy_func, params, args.timeframe)
    
    # Format equity curve for JSON serialization
    for point in results['equity_curve']:
        point['datetime'] = point['datetime'].isoformat()
    
    # Format trades for JSON serialization
    if 'trades' in results:
        for trade in results['trades']:
            if 'datetime' in trade:
                trade['datetime'] = trade['datetime'].isoformat()
    
    return results


if __name__ == "__main__":
    try:
        args = parse_arguments()
        results = run_backtest(args)
        
        # Print results as JSON to stdout (for the Node.js process to capture)
        print(json.dumps(results))
    except Exception as e:
        # Print error as JSON to stderr
        error_json = json.dumps({
            'error': True,
            'message': str(e)
        })
        print(error_json, file=sys.stderr)
        sys.exit(1)