import { Routes, Route, Link, useLocation } from 'react-router-dom';
import StrategyLab from './pages/StrategyLab';
import LiveTrading from './pages/LiveTrading';
import PairsFinder from './pages/PairsFinder';

const navItems = [
  { path: '/', label: 'Strategy Lab' },
  { path: '/live', label: 'Live Trading' },
  { path: '/pairs', label: 'Pairs Finder' },
];

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-vega-dark text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold tracking-wide text-vega-accent">VEGA</span>
              <span className="text-sm text-gray-300">Trading Platform</span>
            </div>
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-vega-primary text-white'
                      : 'text-gray-300 hover:bg-vega-primary/50 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<StrategyLab />} />
          <Route path="/live" element={<LiveTrading />} />
          <Route path="/pairs" element={<PairsFinder />} />
        </Routes>
      </main>
    </div>
  );
}
