import axios from 'axios';
import type { BacktestRequest, BacktestResult, StrategyInfo } from '../types/api';

const api = axios.create({
  baseURL: '/api/v1',
});

export function useApi() {
  const getStrategies = async (): Promise<StrategyInfo[]> => {
    const { data } = await api.get('/strategies');
    return data;
  };

  const runBacktest = async (request: BacktestRequest): Promise<BacktestResult> => {
    const { data } = await api.post('/backtest/run', request);
    return data;
  };

  const startLiveTrading = async (request: {
    strategy: string;
    symbols: string[];
    params: Record<string, unknown>;
    tick_interval: number;
    data_provider: string;
  }) => {
    const { data } = await api.post('/live/start', request);
    return data;
  };

  const stopLiveTrading = async () => {
    const { data } = await api.get('/live/stop');
    return data;
  };

  const getLiveSignals = async () => {
    const { data } = await api.get('/live/signals');
    return data;
  };

  return { getStrategies, runBacktest, startLiveTrading, stopLiveTrading, getLiveSignals };
}
