'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

import NavBar from '@/components/nav-bar';
import BacktestForm from '@/components/backtest-form';
import MetricsPanel from '@/components/metrics-panel';
import EquityCurve from '@/components/equity-curve';
import TradesTable from '@/components/trades-table';

export default function Home() {
  const [backtestResults, setBacktestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRunBacktest = async (backtestConfig) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backtestConfig),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to run backtest');
      }
      
      const results = await response.json();
      setBacktestResults(results);
    } catch (error) {
      console.error('Backtest error:', error);
      setError(error.message || 'An error occurred while running the backtest');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col space-y-4 md:space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Crypto Strategy Backtester</h1>
            <p className="text-muted-foreground">
              Test and optimize your trading strategies across multiple timeframes and assets.
            </p>
          </div>

          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Configuration Panel */}
            <div className="md:col-span-4">
              <BacktestForm onSubmit={handleRunBacktest} isLoading={isLoading} />
            </div>
            
            {/* Results Panel */}
            <div className="md:col-span-8">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="text-sm text-muted-foreground">Running backtest...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : backtestResults ? (
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="equity">Equity Curve</TabsTrigger>
                    <TabsTrigger value="trades">Trades</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <Card>
                      <CardContent className="pt-6">
                        <MetricsPanel metrics={backtestResults} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="equity">
                    <Card>
                      <CardContent className="pt-6">
                        <EquityCurve data={backtestResults.equity_curve} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="trades">
                    <Card>
                      <CardContent className="pt-6">
                        <TradesTable trades={backtestResults.trades || []} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[400px]">
                    <p className="text-muted-foreground">Configure and run a backtest to see results</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Crypto Strategy Backtester. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
