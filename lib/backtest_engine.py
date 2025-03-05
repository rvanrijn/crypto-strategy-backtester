'''
Crypto Strategy Backtester Backend
---------------------------------
This module contains the core backtesting engine for evaluating
trading strategies on cryptocurrency data.
'''

import pandas as pd
import numpy as np
from typing import Dict, List, Callable, Any, Tuple
import time
import json


class BacktestEngine:
    '''
    Core backtesting engine for cryptocurrency trading strategies.
    '''
    
    def __init__(self, data: pd.DataFrame, initial_capital: float = 10000, 
                 commission: float = 0.001):
        '''
        Initialize the backtesting engine.
        
        Args:
            data: DataFrame with OHLCV data
            initial_capital: Starting capital for the backtest
            commission: Trading commission as a decimal (e.g., 0.001 = 0.1%)
        '''
        # Clean column names and ensure correct format
        self.data = data.copy()
        self.data.columns = [col.strip() for col in self.data.columns]
        self.data['datetime'] = pd.to_datetime(self.data['datetime'])
        self.data.set_index('datetime', inplace=True)
        
        # Ensure all required columns exist
        required_cols = ['open', 'high', 'low', 'close', 'volume']
        for col in required_cols:
            if col not in self.data.columns:
                raise ValueError(f"Required column '{col}' not found in data")
        
        # Sort by datetime index
        self.data.sort_index(inplace=True)
        
        # Initialize backtest parameters
        self.initial_capital = initial_capital
        self.commission = commission
        self.current_capital = initial_capital
        self.position = 0  # 0 = no position, 1 = long
        self.position_size = 0.0
        self.entry_price = 0.0
        
        # Initialize result tracking
        self.trades = []
        self.equity_curve = []
        self.metrics = {}
    
    def convert_timeframe(self, timeframe: str) -> pd.DataFrame:
        '''
        Convert data to a different timeframe.
        
        Args:
            timeframe: Target timeframe (e.g., '30min', '1h', '4h', '1d')
            
        Returns:
            DataFrame with resampled data
        '''
        resampled = self.data.resample(timeframe).agg({
            'open': 'first',
            'high': 'max',
            'low': 'min',
            'close': 'last',
            'volume': 'sum'
        })
        return resampled.dropna()
    
    def run_strategy(self, strategy_func: Callable[[pd.DataFrame, Dict[str, Any]], pd.Series], 
                     params: Dict[str, Any] = None, 
                     timeframe: str = None,
                     callback: Callable[[Dict[str, Any]], None] = None) -> Dict[str, Any]:
        '''
        Run a backtest with the given strategy.
        
        Args:
            strategy_func: Function that generates buy/sell signals
            params: Parameters to pass to the strategy function
            timeframe: Optional timeframe to convert data to before running the strategy
            callback: Optional callback function to report progress
            
        Returns:
            Dictionary with backtest results
        '''
        if params is None:
            params = {}
            
        # Convert timeframe if specified
        if timeframe:
            data = self.convert_timeframe(timeframe)
        else:
            data = self.data.copy()
            
        # Generate signals using the strategy function
        signals = strategy_func(data, params)
        
        # Ensure signals is a Series with the same index as data
        if not isinstance(signals, pd.Series):
            raise ValueError("Strategy function must return a pandas Series")
        
        # Align signals with data
        signals = signals.reindex(data.index)
        
        # Reset tracking variables for this run
        self.current_capital = self.initial_capital
        self.position = 0
        self.position_size = 0.0
        self.entry_price = 0.0
        self.trades = []
        self.equity_curve = []
        
        # Run the backtest
        total_bars = len(data)
        for i, (timestamp, row) in enumerate(data.iterrows()):
            # Calculate current equity
            current_price = row['close']
            current_equity = self.current_capital
            if self.position > 0:
                current_equity = self.current_capital + self.position_size * (current_price - self.entry_price)
            
            # Record equity
            self.equity_curve.append({
                'datetime': timestamp,
                'equity': current_equity
            })
            
            # Check for signal
            signal = signals.iloc[i]
            
            # Process signal
            if signal > 0 and self.position == 0:  # BUY signal
                self.position = 1
                self.entry_price = current_price
                self.position_size = self.current_capital * (1 - self.commission) / current_price
                
                self.trades.append({
                    'datetime': timestamp,
                    'type': 'BUY',
                    'price': current_price,
                    'size': self.position_size,
                    'value': self.position_size * current_price,
                    'commission': self.current_capital * self.commission
                })
                
            elif signal < 0 and self.position > 0:  # SELL signal
                exit_price = current_price
                exit_value = self.position_size * exit_price * (1 - self.commission)
                pl = exit_value - (self.position_size * self.entry_price)
                
                self.trades.append({
                    'datetime': timestamp,
                    'type': 'SELL',
                    'price': exit_price,
                    'size': self.position_size,
                    'value': exit_value,
                    'pl': pl,
                    'pl_pct': pl / (self.position_size * self.entry_price) * 100,
                    'commission': exit_value * self.commission
                })
                
                self.current_capital = exit_value
                self.position = 0
                self.position_size = 0.0
            
            # Report progress via callback if provided
            if callback and i % max(1, total_bars // 100) == 0:
                progress = {
                    'progress': i / total_bars * 100,
                    'current_equity': current_equity,
                    'current_timestamp': timestamp
                }
                callback(progress)
        
        # Close any open position at the end of the backtest
        if self.position > 0:
            last_price = data.iloc[-1]['close']
            exit_value = self.position_size * last_price * (1 - self.commission)
            pl = exit_value - (self.position_size * self.entry_price)
            
            self.trades.append({
                'datetime': data.index[-1],
                'type': 'SELL',
                'price': last_price,
                'size': self.position_size,
                'value': exit_value,
                'pl': pl,
                'pl_pct': pl / (self.position_size * self.entry_price) * 100,
                'commission': exit_value * self.commission
            })
            
            self.current_capital = exit_value
        
        # Calculate and return metrics
        self.metrics = self.calculate_metrics()
        return self.metrics
    
    def calculate_metrics(self) -> Dict[str, Any]:
        '''
        Calculate performance metrics from the backtest results.
        
        Returns:
            Dictionary with performance metrics
        '''
        # Filter completed trades (buy and sell pairs)
        completed_trades = [t for t in self.trades if t['type'] == 'SELL']
        
        # If no completed trades, return minimal metrics
        if not completed_trades:
            return {
                'total_trades': 0,
                'net_profit_pct': 0,
                'equity_curve': self.equity_curve
            }
        
        # Extract profit/loss data
        pls = [t['pl'] for t in completed_trades]
        pl_pcts = [t['pl_pct'] for t in completed_trades]
        
        # Calculate equity curve
        equity_series = pd.Series([e['equity'] for e in self.equity_curve], 
                                index=[e['datetime'] for e in self.equity_curve])
        
        # Calculate drawdowns
        running_max = equity_series.cummax()
        drawdowns = (equity_series - running_max) / running_max * 100
        max_drawdown = drawdowns.min()
        
        # Calculate winning and losing trades
        winning_trades = [pl for pl in pls if pl > 0]
        losing_trades = [pl for pl in pls if pl <= 0]
        
        # Avoid division by zero
        avg_win = np.mean(winning_trades) if winning_trades else 0
        avg_loss = np.mean(losing_trades) if losing_trades else 0
        win_loss_ratio = abs(avg_win / avg_loss) if avg_loss != 0 and avg_win != 0 else 0
        
        # Calculate returns
        total_return = (self.current_capital - self.initial_capital) / self.initial_capital * 100
        
        # Calculate annualized metrics
        days = (self.equity_curve[-1]['datetime'] - self.equity_curve[0]['datetime']).days
        if days < 1:
            days = 1  # Avoid division by zero
            
        annual_return = total_return / days * 365
        
        # Calculate Sharpe ratio (assuming risk-free rate of 0)
        daily_returns = equity_series.pct_change().dropna()
        if len(daily_returns) > 1:
            sharpe = np.sqrt(252) * daily_returns.mean() / daily_returns.std()
        else:
            sharpe = 0
            
        # Calculate Calmar ratio
        calmar = abs(annual_return / max_drawdown) if max_drawdown != 0 else 0
        
        # Compile metrics
        metrics = {
            'initial_capital': self.initial_capital,
            'final_capital': self.current_capital,
            'total_return': total_return,
            'annual_return': annual_return,
            'total_trades': len(completed_trades),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'win_rate': len(winning_trades) / len(completed_trades) if completed_trades else 0,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'avg_win_loss_ratio': win_loss_ratio,
            'max_drawdown': max_drawdown,
            'sharpe_ratio': sharpe,
            'calmar_ratio': calmar,
            'equity_curve': self.equity_curve,
            'trades': self.trades
        }
        
        return metrics


class StrategyLibrary:
    '''
    Library of pre-defined trading strategies for the backtester.
    '''
    
    @staticmethod
    def simple_moving_average_crossover(data: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
        '''
        Simple moving average crossover strategy.
        
        Args:
            data: OHLCV DataFrame
            params: Strategy parameters
                - fast_period: Period for fast moving average
                - slow_period: Period for slow moving average
                
        Returns:
            Series with buy/sell signals (1 for buy, -1 for sell, 0 for no action)
        '''
        fast_period = params.get('fast_period', 10)
        slow_period = params.get('slow_period', 50)
        
        # Calculate moving averages
        fast_ma = data['close'].rolling(window=fast_period).mean()
        slow_ma = data['close'].rolling(window=slow_period).mean()
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Buy signal: fast MA crosses above slow MA
        buy_signal = (fast_ma > slow_ma) & (fast_ma.shift(1) <= slow_ma.shift(1))
        signals[buy_signal] = 1
        
        # Sell signal: fast MA crosses below slow MA
        sell_signal = (fast_ma < slow_ma) & (fast_ma.shift(1) >= slow_ma.shift(1))
        signals[sell_signal] = -1
        
        return signals
    
    @staticmethod
    def rsi_strategy(data: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
        '''
        Relative Strength Index (RSI) strategy.
        
        Args:
            data: OHLCV DataFrame
            params: Strategy parameters
                - period: RSI calculation period
                - overbought: Overbought threshold
                - oversold: Oversold threshold
                
        Returns:
            Series with buy/sell signals (1 for buy, -1 for sell, 0 for no action)
        '''
        period = params.get('period', 14)
        overbought = params.get('overbought', 70)
        oversold = params.get('oversold', 30)
        
        # Calculate RSI
        delta = data['close'].diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        
        avg_gain = gain.rolling(window=period).mean()
        avg_loss = loss.rolling(window=period).mean()
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Buy signal: RSI crosses above oversold threshold
        buy_signal = (rsi > oversold) & (rsi.shift(1) <= oversold)
        signals[buy_signal] = 1
        
        # Sell signal: RSI crosses below overbought threshold
        sell_signal = (rsi < overbought) & (rsi.shift(1) >= overbought)
        signals[sell_signal] = -1
        
        return signals
    
    @staticmethod
    def bollinger_bands_strategy(data: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
        '''
        Bollinger Bands strategy.
        
        Args:
            data: OHLCV DataFrame
            params: Strategy parameters
                - period: Bollinger Bands calculation period
                - std_dev: Number of standard deviations for bands
                
        Returns:
            Series with buy/sell signals (1 for buy, -1 for sell, 0 for no action)
        '''
        period = params.get('period', 20)
        std_dev = params.get('std_dev', 2)
        
        # Calculate Bollinger Bands
        middle_band = data['close'].rolling(window=period).mean()
        std = data['close'].rolling(window=period).std()
        upper_band = middle_band + std_dev * std
        lower_band = middle_band - std_dev * std
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Buy signal: price crosses below lower band and then back above it
        price_below_lower = data['close'] < lower_band
        buy_signal = (~price_below_lower) & (price_below_lower.shift(1))
        signals[buy_signal] = 1
        
        # Sell signal: price crosses above upper band and then back below it
        price_above_upper = data['close'] > upper_band
        sell_signal = (~price_above_upper) & (price_above_upper.shift(1))
        signals[sell_signal] = -1
        
        return signals

    @staticmethod
    def macd_strategy(data: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
        '''
        Moving Average Convergence Divergence (MACD) strategy.
        
        Args:
            data: OHLCV DataFrame
            params: Strategy parameters
                - fast_period: Fast EMA period
                - slow_period: Slow EMA period
                - signal_period: Signal line period
                
        Returns:
            Series with buy/sell signals (1 for buy, -1 for sell, 0 for no action)
        '''
        fast_period = params.get('fast_period', 12)
        slow_period = params.get('slow_period', 26)
        signal_period = params.get('signal_period', 9)
        
        # Calculate MACD
        fast_ema = data['close'].ewm(span=fast_period, adjust=False).mean()
        slow_ema = data['close'].ewm(span=slow_period, adjust=False).mean()
        macd_line = fast_ema - slow_ema
        signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Buy signal: MACD line crosses above signal line
        buy_signal = (macd_line > signal_line) & (macd_line.shift(1) <= signal_line.shift(1))
        signals[buy_signal] = 1
        
        # Sell signal: MACD line crosses below signal line
        sell_signal = (macd_line < signal_line) & (macd_line.shift(1) >= signal_line.shift(1))
        signals[sell_signal] = -1
        
        return signals


# Function to load OHLCV data from a CSV file
def load_data_from_csv(file_path: str) -> pd.DataFrame:
    '''
    Load OHLCV data from a CSV file.
    
    Args:
        file_path: Path to the CSV file
        
    Returns:
        DataFrame with OHLCV data
    '''
    data = pd.read_csv(file_path)
    
    # Clean column names
    data.columns = [col.strip() for col in data.columns]
    
    # Ensure datetime column exists
    if 'datetime' not in data.columns:
        raise ValueError("CSV file must contain a 'datetime' column")
    
    # Ensure OHLCV columns exist
    required_cols = ['open', 'high', 'low', 'close', 'volume']
    for col in required_cols:
        if col not in data.columns:
            # Check if column exists with space prefix
            space_col = f' {col}'
            if space_col in data.columns:
                # Rename column
                data[col] = data[space_col]
                data.drop(space_col, axis=1, inplace=True)
            else:
                raise ValueError(f"Required column '{col}' not found in CSV file")
    
    # Convert datetime to pandas datetime
    data['datetime'] = pd.to_datetime(data['datetime'])
    
    return data