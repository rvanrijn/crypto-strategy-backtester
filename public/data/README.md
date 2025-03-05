# Data Files

Place your cryptocurrency OHLCV data files in this directory. The CSV files should have the following format:

## Required CSV Format

```
datetime,open,high,low,close,volume
2023-01-01 00:00:00,16531.83,16532.69,16509.11,16510.82,231.05338022
2023-01-01 00:15:00,16509.78,16534.66,16509.11,16533.43,308.12276951
...
```

## Sample Data

You should use the file `BTCUSD15m2023101T00_00.csv` which contains Bitcoin/USD price data in 15-minute intervals for 2023.

## Adding Your Own Data

You can add your own CSV data files to this directory with the following requirements:

1. Files must be in CSV format
2. Required columns: datetime, open, high, low, close, volume
3. Datetime format should be YYYY-MM-DD HH:MM:SS

The backtester will automatically detect and load any CSV files placed in this directory.
