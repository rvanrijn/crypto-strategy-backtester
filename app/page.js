import StrategyBacktester from './components/strategy-backtester';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Crypto Strategy Backtester</h1>
        <StrategyBacktester />
      </div>
    </main>
  );
}