'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Helper function to format date
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-4 border rounded-md shadow-md">
        <p className="font-medium">{formatDate(label)}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Equity: <span className="font-medium">${payload[0].value.toFixed(2)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function EquityCurve({ data }) {
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('all');
  
  useEffect(() => {
    if (!data || !Array.isArray(data)) {
      setChartData([]);
      return;
    }
    
    // Process data to ensure proper date format and calculate percent change
    const processedData = data.map((point, index) => {
      const initialEquity = data[0]?.equity || 0;
      const percentChange = ((point.equity - initialEquity) / initialEquity) * 100;
      
      return {
        date: point.datetime,
        equity: point.equity,
        percentChange: percentChange
      };
    });
    
    // Filter data based on selected time range
    let filteredData = [...processedData];
    if (timeRange !== 'all' && processedData.length > 0) {
      const lastDate = new Date(processedData[processedData.length - 1].date);
      const filterDate = new Date(lastDate);
      
      switch (timeRange) {
        case '1m':
          filterDate.setMonth(filterDate.getMonth() - 1);
          break;
        case '3m':
          filterDate.setMonth(filterDate.getMonth() - 3);
          break;
        case '6m':
          filterDate.setMonth(filterDate.getMonth() - 6);
          break;
        case '1y':
          filterDate.setFullYear(filterDate.getFullYear() - 1);
          break;
      }
      
      filteredData = processedData.filter(item => new Date(item.date) >= filterDate);
    }
    
    setChartData(filteredData);
  }, [data, timeRange]);

  // No data handling
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">No equity data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Equity Curve</h2>
        
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-auto">
          <TabsList className="grid grid-cols-5 h-8">
            <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
            <TabsTrigger value="1y" className="text-xs px-2">1Y</TabsTrigger>
            <TabsTrigger value="6m" className="text-xs px-2">6M</TabsTrigger>
            <TabsTrigger value="3m" className="text-xs px-2">3M</TabsTrigger>
            <TabsTrigger value="1m" className="text-xs px-2">1M</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Card className="p-2">
        <Tabs defaultValue="equity">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="equity">Equity ($)</TabsTrigger>
            <TabsTrigger value="percent">Return (%)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="equity" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(tick) => {
                    const date = new Date(tick);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                  minTickGap={30}
                  className="text-xs"
                />
                <YAxis 
                  tickFormatter={(tick) => `$${tick.toLocaleString()}`} 
                  className="text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorEquity)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="percent" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(tick) => {
                    const date = new Date(tick);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                  minTickGap={30}
                  className="text-xs"
                />
                <YAxis 
                  tickFormatter={(tick) => `${tick.toFixed(2)}%`} 
                  className="text-xs"
                />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(2)}%`, 'Return']}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Area 
                  type="monotone" 
                  dataKey="percentChange" 
                  stroke="#82ca9d" 
                  fillOpacity={1} 
                  fill="url(#colorPercent)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}