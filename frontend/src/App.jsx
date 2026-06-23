import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SessionsView from './pages/SessionsView';
import HeatmapView from './pages/HeatmapView';
import { ArrowRight } from 'lucide-react';
import './index.css';

function App() {
  return (
    <Router>
      <div className="container">
        <header className="header">
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.3px' }}>Analytics Dashboard</h1>
          </div>
          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Analytics</NavLink>
            <NavLink to="/sessions" className={({ isActive }) => isActive ? 'active' : ''}>Sessions</NavLink>
            <NavLink to="/heatmap" className={({ isActive }) => isActive ? 'active' : ''}>Heatmap</NavLink>
            <NavLink 
              to="http://localhost:5000/demo/index.html" 
              className={({ isActive }) => isActive ? 'active' : ''}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#10b981',
                color: '#fff',
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                fontWeight: '600',
                textDecoration: 'none',
                marginLeft: '0.5rem'
              }}
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
