# Crypto Strategy Backtester

A web-based cryptocurrency trading strategy backtester built with Next.js and Python.

![Crypto Strategy Backtester](https://github.com/rvanrijn/crypto-strategy-backtester/assets/528275/your-image-id-here)

## Features

- **Multi-Timeframe Backtesting**: Test strategies on 15m, 30m, 1h, and 4h timeframes
- **Comprehensive Performance Metrics**: Track trades, profit, drawdowns, Sharpe ratio, and more
- **Custom Strategy Support**: Paste your own Python strategy code directly in the browser
- **Interactive Visualizations**: Equity curves and performance metrics using Recharts
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

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

4. Create required directories:
   ```
   mkdir -p public/data tmp
   ```

5. Add your CSV data files to the `public/data` directory (e.g., BTCUSD15m.csv).

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
├── lib/                    # Python backtesting engine
├── public/                 # Static assets
│   └── data/               # CSV datasets
└── tmp/                    # Temporary files for custom strategies
```

## License

MIT
