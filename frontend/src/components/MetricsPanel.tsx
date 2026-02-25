import type { BacktestMetrics } from '../types/api';

interface Props {
  metrics: BacktestMetrics;
}

function MetricCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

export default function MetricsPanel({ metrics }: Props) {
  const returnColor = metrics.total_return >= 0 ? 'text-green-600' : 'text-red-600';
  const ddColor = 'text-red-600';

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Return"
          value={`${(metrics.total_return * 100).toFixed(2)}%`}
          color={returnColor}
        />
        <MetricCard
          label="CAGR"
          value={`${(metrics.cagr * 100).toFixed(2)}%`}
          color={returnColor}
        />
        <MetricCard
          label="Sharpe Ratio"
          value={metrics.sharpe_ratio.toFixed(3)}
        />
        <MetricCard
          label="Sortino Ratio"
          value={metrics.sortino_ratio.toFixed(3)}
        />
        <MetricCard
          label="Max Drawdown"
          value={`${(metrics.max_drawdown * 100).toFixed(2)}%`}
          color={ddColor}
        />
        <MetricCard
          label="Win Rate"
          value={`${(metrics.win_rate * 100).toFixed(1)}%`}
        />
        <MetricCard
          label="Profit Factor"
          value={metrics.profit_factor === Infinity ? 'Inf' : metrics.profit_factor.toFixed(2)}
        />
        <MetricCard
          label="Total Trades"
          value={metrics.total_trades.toString()}
        />
      </div>
    </div>
  );
}
