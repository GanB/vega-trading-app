import { useState } from 'react';
import type { TradeRecord } from '../types/api';

interface Props {
  trades: TradeRecord[];
}

type SortKey = keyof TradeRecord;

export default function TradeLog({ trades }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...trades].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
    return sortAsc
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: 'timestamp', label: 'Date' },
    { key: 'symbol', label: 'Symbol' },
    { key: 'side', label: 'Side' },
    { key: 'quantity', label: 'Qty' },
    { key: 'price', label: 'Price' },
    { key: 'commission', label: 'Comm.' },
    { key: 'pnl', label: 'PnL' },
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-800 p-4 pb-2">Trade Log</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  {col.label} {sortKey === col.key ? (sortAsc ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sorted.map((trade, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                  {trade.timestamp.split(' ')[0]?.slice(0, 10) || trade.timestamp.slice(0, 10)}
                </td>
                <td className="px-4 py-2 font-medium">{trade.symbol}</td>
                <td className={`px-4 py-2 font-medium ${
                  trade.side === 'BUY' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trade.side}
                </td>
                <td className="px-4 py-2">{trade.quantity.toFixed(2)}</td>
                <td className="px-4 py-2">${trade.price.toFixed(2)}</td>
                <td className="px-4 py-2 text-gray-500">${trade.commission.toFixed(2)}</td>
                <td className={`px-4 py-2 font-medium ${
                  trade.pnl > 0 ? 'text-green-600' : trade.pnl < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {trade.pnl !== 0 ? `$${trade.pnl.toFixed(2)}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trades.length === 0 && (
          <p className="text-center text-gray-400 py-8">No trades to display</p>
        )}
      </div>
    </div>
  );
}
