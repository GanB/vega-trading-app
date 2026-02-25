import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { useWebSocket } from '../hooks/useWebSocket';

export default function LiveTrading() {
  const { startLiveTrading, stopLiveTrading } = useApi();
  const { connected, updates, latestUpdate, connect, disconnect } = useWebSocket();

  const [strategy, setStrategy] = useState('pairs_trading');
  const [symbols, setSymbols] = useState('SYN_A,SYN_B');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setError('');
    try {
      await startLiveTrading({
        strategy,
        symbols: symbols.split(',').map((s) => s.trim()),
        params: {},
        tick_interval: 1.0,
        data_provider: 'synthetic',
      });
      setRunning(true);
      connect();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start');
    }
  };

  const handleStop = async () => {
    try {
      await stopLiveTrading();
      disconnect();
      setRunning(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to stop');
    }
  };

  const equityData = updates.map((u) => ({
    tick: u.tick,
    equity: Math.round(u.equity * 100) / 100,
    pnl: Math.round(u.pnl * 100) / 100,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Live Paper Trading</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              disabled={running}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="pairs_trading">Pairs Trading</option>
              <option value="mean_reversion">Mean Reversion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symbols</label>
            <input
              type="text"
              value={symbols}
              onChange={(e) => setSymbols(e.target.value)}
              disabled={running}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex items-end space-x-2">
            {!running ? (
              <button
                onClick={handleStart}
                className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors"
              >
                Start Trading
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors"
              >
                Stop Trading
              </button>
            )}
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
      </div>

      {latestUpdate && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase">Equity</p>
            <p className="text-2xl font-bold">${latestUpdate.equity.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase">Cash</p>
            <p className="text-2xl font-bold">${latestUpdate.cash.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase">PnL</p>
            <p className={`text-2xl font-bold ${latestUpdate.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${latestUpdate.pnl.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase">Tick</p>
            <p className="text-2xl font-bold">{latestUpdate.tick}</p>
          </div>
        </div>
      )}

      {equityData.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Equity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={equityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tick" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
              <Line type="monotone" dataKey="equity" stroke="#003566" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {latestUpdate && Object.keys(latestUpdate.positions).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Open Positions</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Side</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entry</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(latestUpdate.positions).map(([sym, pos]) => (
                <tr key={sym}>
                  <td className="px-4 py-2 font-medium">{sym}</td>
                  <td className={`px-4 py-2 ${pos.side === 'LONG' ? 'text-green-600' : 'text-red-600'}`}>
                    {pos.side}
                  </td>
                  <td className="px-4 py-2">{pos.quantity.toFixed(2)}</td>
                  <td className="px-4 py-2">${pos.entry_price.toFixed(2)}</td>
                  <td className="px-4 py-2">${pos.current_price.toFixed(2)}</td>
                  <td className={`px-4 py-2 font-medium ${pos.unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${pos.unrealized_pnl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {latestUpdate?.last_signal && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Latest Signal</h3>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{latestUpdate.last_signal.symbol}</span>
            {' '}&mdash;{' '}
            <span className={
              latestUpdate.last_signal.signal === 'LONG' ? 'text-green-600 font-bold'
              : latestUpdate.last_signal.signal === 'SHORT' ? 'text-red-600 font-bold'
              : 'text-gray-500'
            }>
              {latestUpdate.last_signal.signal}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
