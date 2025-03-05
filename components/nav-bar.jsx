import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link 
            href="/" 
            className="flex items-center space-x-2"
          >
            <TrendingUp className="h-6 w-6" />
            <span className="font-bold inline-block">Crypto Backtester</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/docs">Docs</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/datasets">Datasets</Link>
            </Button>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}