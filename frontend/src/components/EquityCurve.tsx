import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { EquityPoint } from '../types/api';

interface Props {
  data: EquityPoint[];
  initialCapital: number;
}

export default function EquityCurve({ data, initialCapital }: Props) {
  const chartData = data.map((point) => ({
    date: point.timestamp.split('T')[0].slice(5),
    equity: Math.round(point.equity * 100) / 100,
    benchmark: initialCapital,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Equity Curve</h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#003566" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#003566" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Equity']}
          />
          <Area
            type="monotone"
            dataKey="benchmark"
            stroke="#94a3b8"
            strokeDasharray="5 5"
            fill="none"
            name="Initial Capital"
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="#003566"
            fill="url(#equityGrad)"
            strokeWidth={2}
            name="Portfolio"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
