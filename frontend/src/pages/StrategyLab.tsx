import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import EquityCurve from '../components/EquityCurve';
import MetricsPanel from '../components/MetricsPanel';
import TradeLog from '../components/TradeLog';
import type { BacktestResult } from '../types/api';

const STRATEGIES = [
  { value: 'pairs_trading', label: 'Pairs Trading' },
  { value: 'mean_reversion', label: 'Mean Reversion' },
  { value: 'momentum', label: 'Momentum' },
];

export default function StrategyLab() {
  const { runBacktest } = useApi();
  const [strategy, setStrategy] = useState('pairs_trading');
  const [symbols, setSymbols] = useState('SYN_A,SYN_B');
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate, setEndDate] = useState('2024-01-01');
  const [capital, setCapital] = useState(100000);
  const [provider, setProvider] = useState('synthetic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await runBacktest({
        strategy,
        symbols: symbols.split(',').map((s) => s.trim()),
        start_date: startDate,
        end_date: endDate,
        params: {},
        initial_capital: capital,
        data_provider: provider,
      });
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Backtest failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Strategy Lab</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-vega-primary focus:border-vega-primary"
            >
              {STRATEGIES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symbols (comma-separated)
            </label>
            <input
              type="text"
              value={symbols}
              onChange={(e) => setSymbols(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="synthetic">Synthetic (no API key)</option>
              <option value="yahoo">Yahoo Finance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Capital</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleRun}
            disabled={loading}
            className="bg-vega-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-vega-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Running Backtest...' : 'Run Backtest'}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-red-600 text-sm">{error}</p>
        )}
      </div>

      {result && (
        <>
          <MetricsPanel metrics={result.metrics} />
          <EquityCurve data={result.equity_curve} initialCapital={capital} />
          <TradeLog trades={result.trades} />
        </>
      )}
    </div>
  );
}
