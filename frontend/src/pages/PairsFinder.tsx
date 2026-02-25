import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useApi } from '../hooks/useApi';

export default function PairsFinder() {
  const { runBacktest } = useApi();
  const [symbolA, setSymbolA] = useState('SYN_A');
  const [symbolB, setSymbolB] = useState('SYN_B');
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate, setEndDate] = useState('2024-01-01');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    equityCurve: { timestamp: string; equity: number }[];
    metrics: Record<string, number>;
    trades: number;
  } | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await runBacktest({
        strategy: 'pairs_trading',
        symbols: [symbolA.trim(), symbolB.trim()],
        start_date: startDate,
        end_date: endDate,
        params: {
          symbol_a: symbolA.trim(),
          symbol_b: symbolB.trim(),
        },
        initial_capital: 100000,
        data_provider: 'synthetic',
      });

      setResult({
        equityCurve: res.equity_curve,
        metrics: res.metrics as unknown as Record<string, number>,
        trades: res.trades.length,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result?.equityCurve.map((p, i) => ({
    idx: i,
    equity: Math.round(p.equity * 100) / 100,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Pairs Finder</h2>
        <p className="text-gray-500 mb-4">
          Enter two tickers to run a cointegration-based pairs trading backtest.
          Uses synthetic data by default (no API key needed).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symbol A</label>
            <input
              type="text"
              value={symbolA}
              onChange={(e) => setSymbolA(e.target.value.toUpperCase())}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="SYN_A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symbol B</label>
            <input
              type="text"
              value={symbolB}
              onChange={(e) => setSymbolB(e.target.value.toUpperCase())}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="SYN_B"
            />
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
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-6 bg-vega-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-vega-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Pair'}
        </button>

        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-500 uppercase">Total Return</p>
              <p className={`text-2xl font-bold ${
                (result.metrics.total_return || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {((result.metrics.total_return || 0) * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-500 uppercase">Sharpe Ratio</p>
              <p className="text-2xl font-bold">{(result.metrics.sharpe_ratio || 0).toFixed(3)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-500 uppercase">Max Drawdown</p>
              <p className="text-2xl font-bold text-red-600">
                {((result.metrics.max_drawdown || 0) * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-500 uppercase">Total Trades</p>
              <p className="text-2xl font-bold">{result.trades}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Pairs Strategy Equity — {symbolA} / {symbolB}
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="idx" tick={{ fontSize: 11 }} label={{ value: 'Trading Days', position: 'insideBottom', offset: -5 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Equity']} />
                <ReferenceLine y={100000} stroke="#94a3b8" strokeDasharray="5 5" label="Initial" />
                <Line type="monotone" dataKey="equity" stroke="#003566" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
