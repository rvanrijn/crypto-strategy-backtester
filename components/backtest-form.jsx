'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import CodeEditor from '@/components/code-editor';

const timeframes = [
  { label: '15 Minutes', value: '15m' },
  { label: '30 Minutes', value: '30m' },
  { label: '1 Hour', value: '1h' },
  { label: '4 Hours', value: '4h' },
];

const predefinedStrategies = [
  { 
    name: 'SMA Crossover', 
    value: 'sma_crossover',
    description: 'Simple Moving Average crossover strategy',
    params: [
      { name: 'fast_period', label: 'Fast Period', default: 10, min: 2, max: 50, step: 1 },
      { name: 'slow_period', label: 'Slow Period', default: 30, min: 5, max: 200, step: 1 }
    ]
  },
  { 
    name: 'RSI', 
    value: 'rsi',
    description: 'Relative Strength Index strategy',
    params: [
      { name: 'period', label: 'RSI Period', default: 14, min: 2, max: 50, step: 1 },
      { name: 'overbought', label: 'Overbought Level', default: 70, min: 50, max: 95, step: 1 },
      { name: 'oversold', label: 'Oversold Level', default: 30, min: 5, max: 50, step: 1 }
    ]
  },
  { 
    name: 'Bollinger Bands', 
    value: 'bollinger_bands',
    description: 'Bollinger Bands mean reversion strategy',
    params: [
      { name: 'period', label: 'Period', default: 20, min: 5, max: 100, step: 1 },
      { name: 'std_dev', label: 'Standard Deviation', default: 2, min: 0.5, max: 4, step: 0.1 }
    ]
  },
  { 
    name: 'MACD', 
    value: 'macd',
    description: 'Moving Average Convergence Divergence strategy',
    params: [
      { name: 'fast_period', label: 'Fast Period', default: 12, min: 2, max: 50, step: 1 },
      { name: 'slow_period', label: 'Slow Period', default: 26, min: 5, max: 100, step: 1 },
      { name: 'signal_period', label: 'Signal Period', default: 9, min: 2, max: 50, step: 1 }
    ]
  },
  {
    name: 'Custom Strategy',
    value: 'custom',
    description: 'Create your own custom strategy with Python code',
    params: []
  }
];

const defaultCustomCode = `# Custom Trading Strategy
# 
# Parameters:
#   - data: pandas DataFrame with OHLCV data
#   - params: dictionary of strategy parameters
#
# Returns:
#   - pandas Series with signals (1 for buy, -1 for sell, 0 for no action)

def custom_strategy(data, params):
    # Example: Simple moving average crossover
    fast_period = params.get('fast_period', 10)
    slow_period = params.get('slow_period', 30)
    
    # Calculate moving averages
    data['fast_ma'] = data['close'].rolling(window=fast_period).mean()
    data['slow_ma'] = data['close'].rolling(window=slow_period).mean()
    
    # Generate signals
    signals = pd.Series(0, index=data.index)
    
    # Buy signal: fast MA crosses above slow MA
    buy_signal = (data['fast_ma'] > data['slow_ma']) & (data['fast_ma'].shift(1) <= data['slow_ma'].shift(1))
    signals[buy_signal] = 1
    
    # Sell signal: fast MA crosses below slow MA
    sell_signal = (data['fast_ma'] < data['slow_ma']) & (data['fast_ma'].shift(1) >= data['slow_ma'].shift(1))
    signals[sell_signal] = -1
    
    return signals
`;

export default function BacktestForm({ onSubmit, isLoading }) {
  const [selectedDataset, setSelectedDataset] = useState('BTCUSD15m2023101T00_00.csv');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedStrategy, setSelectedStrategy] = useState('sma_crossover');
  const [customCode, setCustomCode] = useState(defaultCustomCode);
  const [strategyParams, setStrategyParams] = useState({});
  const [initialCapital, setInitialCapital] = useState(10000);
  
  // Initialize default params for the first strategy
  useState(() => {
    if (predefinedStrategies.length > 0) {
      const defaultParams = {};
      predefinedStrategies[0].params.forEach(param => {
        defaultParams[param.name] = param.default;
      });
      setStrategyParams(defaultParams);
    }
  }, []);

  const handleStrategyChange = (value) => {
    setSelectedStrategy(value);
    
    // Set default params for the selected strategy
    const strategy = predefinedStrategies.find(s => s.value === value);
    if (strategy) {
      const defaultParams = {};
      strategy.params.forEach(param => {
        defaultParams[param.name] = param.default;
      });
      setStrategyParams(defaultParams);
    }
  };
  
  const handleParamChange = (paramName, value) => {
    setStrategyParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };
  
  const handleRunBacktest = () => {
    const backtestConfig = {
      dataset: selectedDataset,
      timeframe: selectedTimeframe,
      strategy: selectedStrategy,
      params: strategyParams,
      initial_capital: initialCapital,
      custom_code: selectedStrategy === 'custom' ? customCode : null
    };
    
    onSubmit(backtestConfig);
  };

  // Get current strategy
  const currentStrategy = predefinedStrategies.find(s => s.value === selectedStrategy);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Backtest Configuration</CardTitle>
        <CardDescription>
          Configure your trading strategy and backtest parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Dataset Selection */}
          <div className="space-y-2">
            <Label htmlFor="dataset">Dataset</Label>
            <Select 
              value={selectedDataset} 
              onValueChange={setSelectedDataset}
            >
              <SelectTrigger id="dataset">
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTCUSD15m2023101T00_00.csv">BTC/USD 15m (2023)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Timeframe Selection */}
          <div className="space-y-2">
            <Label htmlFor="timeframe">Timeframe</Label>
            <Select 
              value={selectedTimeframe} 
              onValueChange={setSelectedTimeframe}
            >
              <SelectTrigger id="timeframe">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map(tf => (
                  <SelectItem key={tf.value} value={tf.value}>
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Strategy Selection */}
          <div className="space-y-2">
            <Label htmlFor="strategy">Strategy</Label>
            <Select 
              value={selectedStrategy} 
              onValueChange={handleStrategyChange}
            >
              <SelectTrigger id="strategy">
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                {predefinedStrategies.map(strategy => (
                  <SelectItem key={strategy.value} value={strategy.value}>
                    {strategy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{currentStrategy?.description}</p>
          </div>
          
          {/* Initial Capital */}
          <div className="space-y-2">
            <Label htmlFor="initial-capital">Initial Capital ($)</Label>
            <Input
              id="initial-capital"
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              min={100}
              step={100}
            />
          </div>
          
          {/* Strategy Parameters or Custom Code */}
          {selectedStrategy === 'custom' ? (
            <div className="space-y-2">
              <Label>Custom Strategy Code</Label>
              <CodeEditor 
                value={customCode} 
                onChange={setCustomCode} 
                language="python"
                height="300px"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Define a Python function called 'custom_strategy' that takes 'data' and 'params' arguments
                and returns a pandas Series with signals.
              </p>
            </div>
          ) : (
            currentStrategy?.params.length > 0 && (
              <div className="space-y-4">
                <Label>Strategy Parameters</Label>
                {currentStrategy.params.map(param => (
                  <div key={param.name} className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor={param.name}>{param.label}</Label>
                      <span className="text-sm font-medium">
                        {strategyParams[param.name] ?? param.default}
                      </span>
                    </div>
                    <Slider
                      id={param.name}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={[strategyParams[param.name] ?? param.default]}
                      onValueChange={(value) => handleParamChange(param.name, value[0])}
                    />
                  </div>
                ))}
              </div>
            )
          )}
          
          {/* Submit Button */}
          <Button 
            onClick={handleRunBacktest} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Running...' : 'Run Backtest'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}