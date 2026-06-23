import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SessionsView from './pages/SessionsView';
import HeatmapView from './pages/HeatmapView';
import { ArrowRight } from 'lucide-react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  return (
    <Router>
      <div className="max-w-6xl mx-auto px-8 py-6 min-h-screen bg-slate-50 text-slate-900 font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
        <header className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200">
          <div>
            <h1 className="m-0 text-xl font-bold tracking-tight">Analytics Dashboard</h1>
          </div>
          <nav className="flex gap-3 items-center">
            <NavLink 
              to="/" 
              end 
              className={({ isActive }) => `px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${isActive ? 'bg-slate-900 text-white font-semibold' : 'text-slate-500 hover:bg-slate-900 hover:text-white hover:font-semibold'}`}
            >
              Analytics
            </NavLink>
            <NavLink 
              to="/sessions" 
              className={({ isActive }) => `px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${isActive ? 'bg-slate-900 text-white font-semibold' : 'text-slate-500 hover:bg-slate-900 hover:text-white hover:font-semibold'}`}
            >
              Sessions
            </NavLink>
            <NavLink 
              to="/heatmap" 
              className={({ isActive }) => `px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${isActive ? 'bg-slate-900 text-white font-semibold' : 'text-slate-500 hover:bg-slate-900 hover:text-white hover:font-semibold'}`}
            >
              Heatmap
            </NavLink>
            <NavLink 
              to={`${API_URL}/demo/index.html`} 
              className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-md font-semibold text-sm transition-colors duration-200 ml-2"
            >
              Demo <ArrowRight size={16} />
            </NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<AnalyticsDashboard />} />
            <Route path="/sessions" element={<SessionsView />} />
            <Route path="/heatmap" element={<HeatmapView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
