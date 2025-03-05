# Crypto Strategy Backtester

A web-based cryptocurrency trading strategy backtester built with Next.js and Python.

## Features

- **Multi-Timeframe Backtesting**: Test strategies on 15m, 30m, 1h, and 4h timeframes
- **Comprehensive Performance Metrics**: Track trades, profit, drawdowns, Sharpe ratio, and more
- **Custom Strategy Support**: Paste your own Python strategy code directly in the browser
- **Interactive Visualizations**: Equity curves and performance metrics using Recharts
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Key Metrics

The backtester provides a rich set of metrics to evaluate your trading strategies:

- **Total Return**: Overall percentage gain or loss
- **Annual Return**: Annualized performance
- **Max Drawdown**: Largest peak-to-trough decline
- **Sharpe Ratio**: Risk-adjusted return measure
- **Calmar Ratio**: Return relative to max drawdown
- **Win Rate**: Percentage of winning trades
- **Total Trades**: Number of completed trades
- **Avg Win/Loss Ratio**: Comparison of winning trades to losing trades

## Getting Started

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- pip

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/rvanrijn/crypto-strategy-backtester.git
   cd crypto-strategy-backtester
   ```

2. Install JavaScript dependencies:
   ```
   npm install
   ```

3. Install Python dependencies:
   ```
   pip install pandas numpy
   ```

4. Add your CSV data files to the `public/data` directory (e.g., BTCUSD15m.csv).
   The CSV should contain the following columns:
   - datetime - Timestamp (YYYY-MM-DD HH:MM:SS format)
   - open - Opening price
   - high - High price
   - low - Low price
   - close - Closing price
   - volume - Volume traded

### Running the Application

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Available Strategies

The backtester comes with several pre-built strategies:

- **SMA Crossover**: Simple Moving Average crossover strategy
- **RSI**: Relative Strength Index strategy
- **Bollinger Bands**: Bollinger Bands mean-reversion strategy
- **MACD**: Moving Average Convergence Divergence strategy
- **Custom Strategy**: Create your own strategy with Python code

## Creating Custom Strategies

You can create custom strategies by selecting the "Custom Strategy" option and writing Python code in the code editor. Your strategy should follow this template:

```python
def custom_strategy(data, params):
    # Your strategy logic here
    # data: pandas DataFrame with OHLCV data
    # params: dictionary of strategy parameters
    
    # Calculate indicators
    
    # Generate signals (1 for buy, -1 for sell, 0 for no action)
    signals = pd.Series(0, index=data.index)
    
    # Add your buy/sell logic
    
    return signals
```

## Project Structure

```
crypto-strategy-backtester/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   ├── page.js             # Main page
│   └── layout.js           # Root layout
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── backtest-form.jsx   # Backtest configuration form
│   ├── code-editor.jsx     # Monaco code editor
│   ├── equity-curve.jsx    # Equity curve chart
│   ├── metrics-panel.jsx   # Performance metrics display
│   └── trades-table.jsx    # Trades history table
├── lib/                    # Python backtesting engine
│   ├── backtest_engine.py  # Core backtesting logic
│   └── backtest_runner.py  # Python script runner
├── public/                 # Static assets
│   └── data/               # CSV datasets
└── tmp/                    # Temporary files for custom strategies
```

## Technologies Used

- **Frontend**: Next.js, React, shadcn/ui, Tailwind CSS, Recharts, Monaco Editor
- **Backend**: Python, pandas, numpy
- **Data Visualization**: Recharts

## License

MIT
