'use client';

import { useState, useEffect } from 'react';
import { Database, FileType, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import NavBar from '@/components/nav-bar';
import DatasetUpload from '@/components/dataset-upload';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to list all datasets
  const fetchDatasets = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This could be replaced with an actual API endpoint that lists files
      // For now, we'll simulate it with a timeout and dummy data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // In a real implementation, you would fetch this from an API endpoint
      const availableDatasets = [
        {
          name: 'BTCUSD15m2023101T00_00.csv',
          size: '4.2 MB',
          rows: 31066,
          date: '2023-01-01 to 2023-11-20',
          timeframe: '15m'
        }
      ];
      
      setDatasets(availableDatasets);
    } catch (err) {
      setError('Failed to load datasets. Please try again.');
      console.error('Error fetching datasets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load datasets on mount
  useEffect(() => {
    fetchDatasets();
  }, []);

  // Handle successful upload
  const handleUploadSuccess = (filename) => {
    // Refresh the dataset list
    fetchDatasets();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col space-y-4 md:space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
            <p className="text-muted-foreground">
              Manage your cryptocurrency datasets for backtesting
            </p>
          </div>

          <Separator />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload section */}
            <div className="lg:col-span-1">
              <DatasetUpload onUploadSuccess={handleUploadSuccess} />
            </div>
            
            {/* Datasets list */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Available Datasets</CardTitle>
                  <CardDescription>
                    Cryptocurrency OHLCV data files for backtesting
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : datasets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <Database className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No datasets available. Upload a dataset to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {datasets.map((dataset, index) => (
                        <Card key={index} className="overflow-hidden">
                          <div className="p-4 flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-md">
                              <FileType className="h-8 w-8 text-primary" />
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-medium truncate">{dataset.name}</h3>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                                <div>Size: {dataset.size}</div>
                                <div>Rows: {dataset.rows.toLocaleString()}</div>
                                <div>Date Range: {dataset.date}</div>
                                <div>Timeframe: {dataset.timeframe}</div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
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
