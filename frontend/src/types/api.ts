export interface BacktestRequest {
  strategy: string;
  symbols: string[];
  start_date: string;
  end_date: string;
  params: Record<string, unknown>;
  initial_capital: number;
  data_provider: string;
}

export interface EquityPoint {
  timestamp: string;
  equity: number;
}

export interface TradeRecord {
  timestamp: string;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  commission: number;
  pnl: number;
}

export interface BacktestMetrics {
  total_return: number;
  cagr: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown: number;
  max_drawdown_peak: string | null;
  max_drawdown_trough: string | null;
  win_rate: number;
  profit_factor: number;
  total_trades: number;
  final_equity: number;
}

export interface BacktestResult {
  equity_curve: EquityPoint[];
  trades: TradeRecord[];
  metrics: BacktestMetrics;
  portfolio_state: Record<string, unknown>;
}

export interface StrategyInfo {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface LiveUpdate {
  timestamp: string;
  tick: number;
  equity: number;
  cash: number;
  pnl: number;
  positions: Record<string, {
    quantity: number;
    entry_price: number;
    current_price: number;
    unrealized_pnl: number;
    side: string;
  }>;
  last_signal: {
    symbol: string;
    signal: string;
    quantity: number;
    metadata: Record<string, unknown>;
  } | null;
}
