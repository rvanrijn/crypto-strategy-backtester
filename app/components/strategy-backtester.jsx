import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';

// Mock data for demonstration
const mockPerformanceData = [
  { name: 'Jan', equity: 10000, benchmark: 10000 },
  { name: 'Feb', equity: 10500, benchmark: 10200 },
  { name: 'Mar', equity: 10800, benchmark: 10300 },
  { name: 'Apr', equity: 11200, benchmark: 10500 },
  { name: 'May', equity: 11000, benchmark: 10400 },
];

const mockTradesData = [
  { id: 1, date: '2023-01-15', type: 'Buy', price: 25000, amount: 0.5, profit: 250 },
  { id: 2, date: '2023-02-20', type: 'Sell', price: 26000, amount: 0.5, profit: 500 },
  { id: 3, date: '2023-03-10', type: 'Buy', price: 24000, amount: 0.5, profit: -100 },
];

const StrategyBacktester = () => {
  const [dataset, setDataset] = useState('BTC/USD 15m');
  const [timeframe, setTimeframe] = useState('15 Minutes');
  const [strategy, setStrategy] = useState('SMA Crossover');

  const handleRunBacktest = () => {
    // Placeholder for actual backtest logic
    console.log('Running backtest with:', { dataset, timeframe, strategy });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategy Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Strategy Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Dataset</label>
              <Select value={dataset} onValueChange={setDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Dataset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC/USD 15m">BTC/USD 15m</SelectItem>
                  <SelectItem value="ETH/USD 1h">ETH/USD 1h</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timeframe</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15 Minutes">15 Minutes</SelectItem>
                  <SelectItem value="30 Minutes">30 Minutes</SelectItem>
                  <SelectItem value="1 Hour">1 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Strategy</label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMA Crossover">SMA Crossover</SelectItem>
                  <SelectItem value="RSI">RSI</SelectItem>
                  <SelectItem value="Custom">Custom Strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleRunBacktest}>Run Backtest</Button>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Return', value: '15.20%', color: 'text-green-600' },
                { label: 'Max Drawdown', value: '-5.50%', color: 'text-red-600' },
                { label: 'Sharpe Ratio', value: '1.75', color: 'text-blue-600' },
                { label: 'Win Rate', value: '62%', color: 'text-purple-600' }
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">{label}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><Info size={16} className="text-gray-400" /></TooltipTrigger>
                        <TooltipContent>
                          <p>Detailed explanation of {label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className={`font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equity Curve */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="equity" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="benchmark" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr>
                  {['Date', 'Type', 'Price', 'Amount', 'Profit'].map(header => (
                    <th key={header} className="px-4 py-2 border-b">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockTradesData.map(trade => (
                  <tr key={trade.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2">{trade.date}</td>
                    <td className={`px-4 py-2 ${trade.type === 'Buy' ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.type}
                    </td>
                    <td className="px-4 py-2">${trade.price}</td>
                    <td className="px-4 py-2">{trade.amount}</td>
                    <td className={`px-4 py-2 ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${trade.profit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyBacktester;