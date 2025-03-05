'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
};

// Format currency
const formatCurrency = (value) => {
  if (value === undefined || value === null) return '-';
  return '$' + value.toFixed(2);
};

// Format percentage
const formatPercent = (value) => {
  if (value === undefined || value === null) return '-';
  return value.toFixed(2) + '%';
};

export default function TradesTable({ trades }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  
  // Filter trades based on search term
  const filteredTrades = trades.filter(trade => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      trade.type?.toLowerCase().includes(searchLower) ||
      formatDate(trade.datetime).toLowerCase().includes(searchLower) ||
      trade.price?.toString().includes(searchTerm)
    );
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTrades.slice(indexOfFirstItem, indexOfLastItem);
  
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Trade History</h2>
        
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trades..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">P/L</TableHead>
              <TableHead className="text-right">P/L %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((trade, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant={trade.type === 'BUY' ? 'default' : 'secondary'}>
                      {trade.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{formatDate(trade.datetime)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(trade.price)}</TableCell>
                  <TableCell className="text-right font-mono">{trade.size?.toFixed(8)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(trade.value)}</TableCell>
                  <TableCell className={`text-right font-mono ${
                    trade.pl > 0 
                      ? 'text-green-600 dark:text-green-500' 
                      : trade.pl < 0 
                      ? 'text-red-600 dark:text-red-500' 
                      : ''
                  }`}>
                    {trade.pl ? formatCurrency(trade.pl) : '-'}
                  </TableCell>
                  <TableCell className={`text-right font-mono ${
                    trade.pl_pct > 0 
                      ? 'text-green-600 dark:text-green-500' 
                      : trade.pl_pct < 0 
                      ? 'text-red-600 dark:text-red-500' 
                      : ''
                  }`}>
                    {trade.pl_pct ? formatPercent(trade.pl_pct) : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  {searchTerm ? 'No trades matching your search' : 'No trades available'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {pageNumbers.map(number => (
              <PaginationItem key={number}>
                <PaginationLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(number);
                  }}
                  isActive={currentPage === number}
                >
                  {number}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      <div className="text-sm text-muted-foreground">
        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTrades.length)} of {filteredTrades.length} trades
      </div>
    </div>
  );
}