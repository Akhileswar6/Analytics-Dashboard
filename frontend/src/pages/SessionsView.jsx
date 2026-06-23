import { useEffect, useState } from 'react';

export default function SessionsView() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);
  const [sessionEvents, setSessionEvents] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('http://localhost:5000/api/sessions');
        setSessions(await res.json());
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const fetchSessionEvents = async (sessionId) => {
    if (sessionEvents[sessionId]) return;
    try {
      const res = await fetch(`http://localhost:5000/api/sessions/${sessionId}/events`);
      const events = await res.json();
      setSessionEvents(prev => ({ ...prev, [sessionId]: events }));
    } catch (error) {
      console.error('Error fetching events:', error);
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
    if (!ms) return '< 1s';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  };

  const formatTimeInfo = (ts) => {
    const d = new Date(ts);
    const timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const parts = timeString.split(' ');
    return {
      time: parts[0],
      ampm: parts[1] || ''
    };
  };

  const getEventTitle = (evt) => {
    switch (evt.eventType) {
      case 'page_view': return 'Viewed Page';
      case 'click': return 'Clicked Element';
      case 'product_view': return 'Product Viewed';
      case 'add_to_cart': return 'Add To Cart';
      case 'wishlist_add': return 'Wishlisted';
      case 'search': return 'Searched';
      case 'checkout_started': return 'Checkout Started';
      case 'order_placed': return 'Order Placed';
      case 'session_end': return 'Session Ended';
      case 'login_click': return 'Log In Clicked';
      case 'signup_click': return 'Sign Up Clicked';
      default: return evt.eventType;
    }
  };

  const clickColors = [
    { bg: '#dbeafe', color: '#1d4ed8' }, // Blue
    { bg: '#ede9fe', color: '#6d28d9' }, // Purple
    { bg: '#dcfce7', color: '#15803d' }, // Green
    { bg: '#ffedd5', color: '#c2410c' }, // Orange
    { bg: '#ffe4e6', color: '#be123c' }  // Pink
  ];

  const getColorForText = (text) => {
    if (!text) return { bg: '#f1f5f9', color: '#334155' };
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return clickColors[Math.abs(hash) % clickColors.length];
  };

  const getEventDetail = (evt) => {
    switch (evt.eventType) {
      case 'page_view': return evt.pageName || evt.pageUrl;
      case 'click':
        if (!evt.elementText) return `Coordinates: (${evt.x}, ${evt.y})`;
        const style = getColorForText(evt.elementText);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span>Coordinates: ({evt.x}, {evt.y})</span>
            <span style={{ color: '#cbd5e1' }}>—</span>
            <span style={{
              backgroundColor: style.bg,
              color: style.color,
              fontWeight: 600,
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              fontSize: '0.75rem'
            }}>
              {evt.elementText}
            </span>
          </div>
        );
      case 'product_view': return evt.productName || evt.productId;
      case 'add_to_cart': return evt.productName || evt.productId;
      case 'wishlist_add': return evt.productName || evt.productId;
      case 'search': return `"${evt.query}"`;
      case 'order_placed': return evt.orderValue ? `$${evt.orderValue}` : null;
      case 'session_end': return evt.sessionDuration ? `Duration: ${formatDuration(evt.sessionDuration * 1000)}` : null;
      case 'login_click': {
        const style = getColorForText('Log In');
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {evt.x !== undefined && evt.y !== undefined ? (
              <>
                <span>Coordinates: ({evt.x}, {evt.y})</span>
                <span style={{ color: '#cbd5e1' }}>—</span>
              </>
            ) : null}
            <span style={{
              backgroundColor: style.bg, color: style.color,
              fontWeight: 600, padding: '0.15rem 0.4rem',
              borderRadius: '4px', fontSize: '0.75rem'
            }}>Log In</span>
          </div>
        );
      }
      case 'signup_click': {
        const style = getColorForText('Sign Up');
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {evt.x !== undefined && evt.y !== undefined ? (
              <>
                <span>Coordinates: ({evt.x}, {evt.y})</span>
                <span style={{ color: '#cbd5e1' }}>—</span>
              </>
            ) : null}
            <span style={{
              backgroundColor: style.bg, color: style.color,
              fontWeight: 600, padding: '0.15rem 0.4rem',
              borderRadius: '4px', fontSize: '0.75rem'
            }}>Sign Up</span>
          </div>
        );
      }
      default: return null;
    }
  };

  const getEventBadgeClass = (type) => {
    const map = {
      page_view: '',
      click: 'badge-gray',
      product_view: 'badge-blue',
      add_to_cart: 'badge-indigo',
      wishlist_add: 'badge-pink',
      search: '',
      checkout_started: 'badge-indigo',
      order_placed: 'badge-green',
      session_end: 'badge-gray',
      login_click: 'badge-blue',
      signup_click: 'badge-blue',
    };
    return map[type] || '';
  };

  const filteredSessions = sessions.filter(s =>
    s.sessionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#94a3b8', fontSize: '0.9rem' }}>Loading Sessions...</div>;

  const totalSessions = sessions.length;
  const totalEvents = sessions.reduce((acc, s) => acc + s.eventCount, 0);
  const avgEvents = sessions.length ? Math.round(totalEvents / sessions.length) : 0;

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>User Sessions</h2>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
          Explore individual user journeys and event timelines.
        </p>
      </div>

      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* Card Header with Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session Directory</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Detailed list of all captured sessions</p>
          </div>
          <input
            type="text"
            placeholder="Search by Session ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              width: '280px',
              outline: 'none'
            }}
          />
        </div>

        {filteredSessions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            No sessions match your search criteria.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredSessions.map((session, index) => (
            <div key={session.sessionId} style={{ borderBottom: index < filteredSessions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              {/* Session Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  background: expandedSession === session.sessionId ? '#f8fafc' : '#ffffff',
                  transition: 'background 0.2s'
                }}
                onClick={() => toggleSession(session.sessionId)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = expandedSession === session.sessionId ? '#f8fafc' : '#ffffff'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: '#e2e8f0', color: '#334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.2rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 400, marginRight: '0.3rem' }}>ID:</span>
                      {session.sessionId}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>Date: {new Date(session.lastEventAt).toLocaleString()}</span>
                      {session.pageUrl && (
                        <span>URL: <a href={session.pageUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#3b82f6', textDecoration: 'none' }}>{session.pageUrl.replace('http://localhost:5000', '') || session.pageUrl}</a></span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{session.eventCount}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Events</div>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                    {expandedSession === session.sessionId ? '▲' : '▼'}
                  </div>
                </div>
              </div>

              {/* Session Timeline Details */}
              {expandedSession === session.sessionId && (
                <div style={{ padding: '1.5rem 2rem 2rem 4.5rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', paddingLeft: '80px' }}>Event Timeline</h4>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {sessionEvents[session.sessionId] ? (
                      sessionEvents[session.sessionId].map((evt, idx) => (
                        <div key={idx} style={{ display: 'flex', marginBottom: idx === sessionEvents[session.sessionId].length - 1 ? '0' : '1.5rem', position: 'relative' }}>

                          {/* Timestamp Block */}
                          <div style={{ width: '60px', flexShrink: 0, textAlign: 'right', paddingRight: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                            <div style={{ fontWeight: 500 }}>{formatTimeInfo(evt.timestamp).time}</div>
                            <div style={{ fontSize: '0.75rem' }}>{formatTimeInfo(evt.timestamp).ampm}</div>
                          </div>

                          {/* Timeline Line & Dot */}
                          <div style={{ position: 'relative', width: '20px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                            {/* Vertical Line - extends to the next item unless it's the last one */}
                            <div style={{ position: 'absolute', top: '0', bottom: idx === sessionEvents[session.sessionId].length - 1 ? '0' : '-1.5rem', width: '2px', background: '#e2e8f0' }}></div>

                            {/* Blue Dot */}
                            <div style={{ position: 'absolute', top: '6px', width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', zIndex: 1 }}></div>
                          </div>

                          {/* Content Block */}
                          <div style={{ flexGrow: 1, paddingLeft: '1rem' }}>
                            <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, marginBottom: '0.3rem' }}>
                              {getEventTitle(evt)}
                            </div>
                            {getEventDetail(evt) && (
                              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                {getEventDetail(evt)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Loading timeline events...</div>
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
