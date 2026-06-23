import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SessionsDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [products, setProducts] = useState(null);
  const [behavior, setBehavior] = useState(null);
  
  const [sessions, setSessions] = useState([]);
  const [expandedSession, setExpandedSession] = useState(null);
  const [sessionEvents, setSessionEvents] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [resOverview, resFunnel, resProducts, resBehavior, resSessions] = await Promise.all([
          fetch(`${API_URL}/api/stats/overview`),
          fetch(`${API_URL}/api/stats/funnel`),
          fetch(`${API_URL}/api/stats/products`),
          fetch(`${API_URL}/api/stats/behavior`),
          fetch(`${API_URL}/api/sessions`)
        ]);

        setOverview(await resOverview.json());
        setFunnel(await resFunnel.json());
        setProducts(await resProducts.json());
        setBehavior(await resBehavior.json());
        setSessions(await resSessions.json());
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const fetchSessionEvents = async (sessionId) => {
    if (sessionEvents[sessionId]) return; // Already fetched
    try {
      const res = await fetch(`${API_URL}/api/sessions/${sessionId}/events`);
      const events = await res.json();
      setSessionEvents(prev => ({ ...prev, [sessionId]: events }));
    } catch (error) {
      console.error('Error fetching session events:', error);
    }
  };

  const toggleSession = (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
    } else {
      setExpandedSession(sessionId);
      fetchSessionEvents(sessionId);
    }
  };

  const formatDuration = (ms) => {
    if (!ms) return '0s';
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const filteredSessions = sessions.filter(s => s.sessionId.includes(searchQuery));

  if (loading) {
    return <div className="loading">Loading Analytics Dashboard...</div>;
  }

  // Calculate Funnel Percentages
  const funnelMax = funnel?.productViews || 1; // avoid division by zero
  const getPercent = (value) => Math.round((value / funnelMax) * 100);

  return (
    <div className="dashboard-container">
      

      {/* 1. Summary Cards */}
      <div className="summary-grid">
        <div className="stat-card">
          <div className="stat-label">Total Sessions</div>
          <div className="stat-value">{overview?.totalSessions || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Events</div>
          <div className="stat-value">{overview?.totalEvents || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Products Viewed</div>
          <div className="stat-value">{overview?.productsViewed || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Orders Placed</div>
          <div className="stat-value success">{overview?.ordersPlaced || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Session Time</div>
          <div className="stat-value">{formatDuration((overview?.avgSessionTime || 0) * 1000)}</div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        
        {/* 2. Conversion Funnel */}
        <div className="card funnel-card">
          <h2 className="card-title">Conversion Funnel</h2>
          <div className="funnel-container">
            <div className="funnel-step">
              <div className="funnel-label">Product Views</div>
              <div className="funnel-bar-wrapper">
                <div className="funnel-bar" style={{ width: '100%', background: '#3b82f6' }}></div>
              </div>
              <div className="funnel-percent">100%</div>
              <div className="funnel-count">{funnel?.productViews || 0}</div>
            </div>
            
            <div className="funnel-step">
              <div className="funnel-label">Add To Cart</div>
              <div className="funnel-bar-wrapper">
                <div className="funnel-bar" style={{ width: `${getPercent(funnel?.addToCart)}%`, background: '#6366f1' }}></div>
              </div>
              <div className="funnel-percent">{getPercent(funnel?.addToCart)}%</div>
              <div className="funnel-count">{funnel?.addToCart || 0}</div>
            </div>

            <div className="funnel-step">
              <div className="funnel-label">Checkout Started</div>
              <div className="funnel-bar-wrapper">
                <div className="funnel-bar" style={{ width: `${getPercent(funnel?.checkoutStarted)}%`, background: '#8b5cf6' }}></div>
              </div>
              <div className="funnel-percent">{getPercent(funnel?.checkoutStarted)}%</div>
              <div className="funnel-count">{funnel?.checkoutStarted || 0}</div>
            </div>

            <div className="funnel-step">
              <div className="funnel-label">Orders Placed</div>
              <div className="funnel-bar-wrapper">
                <div className="funnel-bar" style={{ width: `${getPercent(funnel?.ordersPlaced)}%`, background: '#10b981' }}></div>
              </div>
              <div className="funnel-percent">{getPercent(funnel?.ordersPlaced)}%</div>
              <div className="funnel-count">{funnel?.ordersPlaced || 0}</div>
            </div>
          </div>
        </div>

        {/* 3. Product Stats */}
        <div className="card list-card">
          <h2 className="card-title">Most Viewed Products</h2>
          <ul className="leaderboard">
            {products?.mostViewed?.map((p, i) => (
              <li key={i}>
                <span className="leaderboard-name">{p._id}</span>
                <span className="badge">{p.count}</span>
              </li>
            )) || <li className="empty-state">No data yet</li>}
          </ul>
        </div>

        <div className="card list-card">
          <h2 className="card-title">Top Added Products</h2>
          <ul className="leaderboard">
            {products?.topAdded?.map((p, i) => (
              <li key={i}>
                <span className="leaderboard-name">{p._id}</span>
                <span className="badge badge-indigo">{p.count}</span>
              </li>
            )) || <li className="empty-state">No data yet</li>}
          </ul>
        </div>

        <div className="card list-card">
          <h2 className="card-title">Most Wishlisted</h2>
          <ul className="leaderboard">
            {products?.mostWishlisted?.map((p, i) => (
              <li key={i}>
                <span className="leaderboard-name">{p._id}</span>
                <span className="badge badge-pink">{p.count}</span>
              </li>
            )) || <li className="empty-state">No data yet</li>}
          </ul>
        </div>

        {/* 4. Behavior Stats */}
        <div className="card list-card">
          <h2 className="card-title">Most Visited Pages</h2>
          <ul className="leaderboard">
            {behavior?.mostVisitedPages?.map((p, i) => (
              <li key={i}>
                <span className="leaderboard-name capitalize">{p._id}</span>
                <span className="badge">{p.count}</span>
              </li>
            )) || <li className="empty-state">No data yet</li>}
          </ul>
        </div>

        <div className="card list-card">
          <h2 className="card-title">Most Clicked Elements</h2>
          <ul className="leaderboard">
            {behavior?.mostClickedElements?.map((e, i) => (
              <li key={i}>
                <span className="leaderboard-name">{e._id}</span>
                <span className="badge badge-gray">{e.count}</span>
              </li>
            )) || <li className="empty-state">No data yet</li>}
          </ul>
        </div>

        <div className="card list-card">
          <h2 className="card-title">Popular Searches</h2>
          <ul className="leaderboard">
            {behavior?.popularSearches?.map((s, i) => (
              <li key={i}>
                <span className="leaderboard-name">"{s._id}"</span>
                <span className="badge badge-blue">{s.count}</span>
              </li>
            )) || <li className="empty-state">No data yet</li>}
          </ul>
        </div>
      </div>

      {/* 5. Sessions Timeline (Original Feature) */}
      <div className="card mt-2">
        <h2 className="card-title">Raw Session Timelines</h2>
        <div className="search-bar-container" style={{ margin: '1rem 0' }}>
          <input 
            type="text" 
            placeholder="Search sessions by ID..." 
            className="input search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="accordion-list">
          {filteredSessions.map(session => (
            <div key={session.sessionId} className="accordion-item">
              <div 
                className={`accordion-header ${expandedSession === session.sessionId ? 'active' : ''}`}
                onClick={() => toggleSession(session.sessionId)}
              >
                <div className="accordion-header-content">
                  <div className="avatar">
                    {session.sessionId.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="session-title">Session: {session.sessionId.substring(0, 8)}...</h3>
                    <p className="session-meta">
                      {session.eventCount} events • {formatDuration(session.durationMs)}
                    </p>
                  </div>
                </div>
                <div className="accordion-icon">
                  {expandedSession === session.sessionId ? '▲' : '▼'}
                </div>
              </div>

              {expandedSession === session.sessionId && (
                <div className="accordion-body">
                  <div className="inline-timeline">
                    {sessionEvents[session.sessionId] ? (
                      sessionEvents[session.sessionId].map((evt, idx) => (
                        <div key={idx} className="timeline-event">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <span className="event-type badge badge-sm">
                              {evt.eventType}
                            </span>
                            <span className="event-time">
                              {new Date(evt.timestamp).toLocaleTimeString()}
                            </span>
                            {evt.pageName && <span className="event-meta ml-2 text-sm text-muted">[{evt.pageName}]</span>}
                            {evt.productName && <span className="event-meta ml-2 text-sm text-accent">{evt.productName}</span>}
                            {evt.elementText && (
                              <span className="event-meta ml-2 text-sm text-muted">
                                Click: "{evt.elementText}"
                                {(evt.eventType === 'login_click' || evt.eventType === 'signup_click') && evt.x !== undefined && evt.y !== undefined ? ` (x: ${evt.x}, y: ${evt.y})` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="loading">Loading timeline...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
