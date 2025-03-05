import { 
  Activity, 
  TrendingUp, 
  ArrowDown, 
  BarChart, 
  Calendar,
  Percent, 
  DollarSign, 
  ShoppingCart 
} from 'lucide-react';

// Helper function to format numbers
const formatNumber = (value, decimals = 2, prefix = '', suffix = '') => {
  if (value === undefined || value === null) return 'N/A';
  
  const formatted = typeof value === 'number' 
    ? `${prefix}${value.toFixed(decimals)}${suffix}`
    : value;
    
  return formatted;
};

export default function MetricsPanel({ metrics }) {
  if (!metrics) {
    return <div>No metrics available</div>;
  }
  
  const metricsData = [
    {
      title: "Total Return",
      value: formatNumber(metrics.total_return, 2, '', '%'),
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      description: "Overall return on investment",
      positive: metrics.total_return > 0,
    },
    {
      title: "Annual Return",
      value: formatNumber(metrics.annual_return, 2, '', '%'),
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
      description: "Annualized return rate",
      positive: metrics.annual_return > 0,
    },
    {
      title: "Max Drawdown",
      value: formatNumber(metrics.max_drawdown, 2, '', '%'),
      icon: <ArrowDown className="h-4 w-4 text-muted-foreground" />,
      description: "Maximum peak-to-trough decline",
      positive: false, // Drawdown is always negative
    },
    {
      title: "Sharpe Ratio",
      value: formatNumber(metrics.sharpe_ratio, 2),
      icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
      description: "Risk-adjusted return measure",
      positive: metrics.sharpe_ratio > 1,
    },
    {
      title: "Calmar Ratio",
      value: formatNumber(metrics.calmar_ratio, 2),
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
      description: "Return relative to max drawdown",
      positive: metrics.calmar_ratio > 1,
    },
    {
      title: "Win Rate",
      value: formatNumber(metrics.win_rate * 100, 1, '', '%'),
      icon: <Percent className="h-4 w-4 text-muted-foreground" />,
      description: "Percentage of winning trades",
      positive: metrics.win_rate > 0.5,
    },
    {
      title: "Total Trades",
      value: metrics.total_trades,
      icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" />,
      description: "Number of completed trades",
      positive: null, // Neutral
    },
    {
      title: "Avg Win/Loss Ratio",
      value: formatNumber(metrics.avg_win_loss_ratio, 2),
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      description: "Average win to average loss ratio",
      positive: metrics.avg_win_loss_ratio > 1,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">Performance Metrics</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metricsData.map((metric) => (
          <div 
            key={metric.title} 
            className="space-y-2 bg-card border rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
              {metric.icon}
            </div>
            <p className={`text-2xl font-bold ${
              metric.positive === null 
                ? '' 
                : metric.positive 
                  ? 'text-green-600 dark:text-green-500' 
                  : 'text-red-600 dark:text-red-500'
            }`}>
              {metric.value}
            </p>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 bg-card border rounded-lg p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Initial Capital</p>
          <p className="text-xl font-bold">${formatNumber(metrics.initial_capital, 2)}</p>
        </div>
        <div className="space-y-2 bg-card border rounded-lg p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Final Capital</p>
          <p className={`text-xl font-bold ${
            metrics.final_capital > metrics.initial_capital 
              ? 'text-green-600 dark:text-green-500' 
              : 'text-red-600 dark:text-red-500'
          }`}>
            ${formatNumber(metrics.final_capital, 2)}
          </p>
        </div>
      </div>
    </div>
  );
}