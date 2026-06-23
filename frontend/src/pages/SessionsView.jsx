import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SessionsView() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);
  const [sessionEvents, setSessionEvents] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch(`${API_URL}/api/sessions`);
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
      const res = await fetch(`${API_URL}/api/sessions/${sessionId}/events`);
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
        const style1 = getColorForText(evt.elementText);
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>Coordinates: ({evt.x}, {evt.y})</span>
            <span className="text-slate-300">—</span>
            <span style={{ backgroundColor: style1.bg, color: style1.color }} className="font-semibold px-2 py-0.5 rounded text-xs">
              {evt.elementText}
            </span>
          </div>
        );
      case 'product_view': return evt.productName || evt.productId;
      case 'add_to_cart': return evt.productName || evt.productId;
      case 'wishlist_add': return evt.productName || evt.productId;
      case 'search': return `"${evt.query}"`;
      case 'session_end': return evt.sessionDuration ? `Duration: ${formatDuration(evt.sessionDuration * 1000)}` : null;
      case 'login_click': {
        const style2 = getColorForText('Log In');
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {evt.x !== undefined && evt.y !== undefined ? (
              <>
                <span>Coordinates: ({evt.x}, {evt.y})</span>
                <span className="text-slate-300">—</span>
              </>
            ) : null}
            <span style={{ backgroundColor: style2.bg, color: style2.color }} className="font-semibold px-2 py-0.5 rounded text-xs">Log In</span>
          </div>
        );
      }
      case 'signup_click': {
        const style3 = getColorForText('Sign Up');
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {evt.x !== undefined && evt.y !== undefined ? (
              <>
                <span>Coordinates: ({evt.x}, {evt.y})</span>
                <span className="text-slate-300">—</span>
              </>
            ) : null}
            <span style={{ backgroundColor: style3.bg, color: style3.color }} className="font-semibold px-2 py-0.5 rounded text-xs">Sign Up</span>
          </div>
        );
      }
      default: return null;
    }
  };

  const getEventBadgeClass = (type) => {
    const map = {
      page_view: '',
      click: 'bg-slate-100 text-slate-600',
      product_view: 'bg-blue-100 text-blue-600',
      add_to_cart: 'bg-indigo-100 text-indigo-600',
      wishlist_add: 'bg-pink-100 text-pink-600',
      search: '',
      session_end: 'bg-slate-100 text-slate-600',
      login_click: 'bg-blue-100 text-blue-600',
      signup_click: 'bg-blue-100 text-blue-600',
    };
    return map[type] || '';
  };

  const filteredSessions = sessions.filter(s =>
    s.sessionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">Loading Sessions...</div>;

  const totalSessions = sessions.length;
  const totalEvents = sessions.reduce((acc, s) => acc + s.eventCount, 0);
  const avgEvents = sessions.length ? Math.round(totalEvents / sessions.length) : 0;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5" style={{}}>
        <h2 className="text-lg font-bold text-slate-900 m-0">User Sessions</h2>
        <p className="text-slate-500 text-xs mt-1">
          Explore individual user journeys and event timelines.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Card Header with Search */}
        <div className="flex flex-col md:flex-row justify-between md:items-center px-6 py-5 border-b border-slate-200 gap-4">
          <div>
            <h3 className="m-0 text-sm font-bold text-slate-900 uppercase tracking-wide">Session Directory</h3>
            <p className="m-0 text-xs text-slate-500 mt-1">Detailed list of all captured sessions</p>
          </div>
          <input
            type="text"
            placeholder="Search by Session ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-md border border-slate-300 text-sm w-full md:w-72 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            No sessions match your search criteria.
          </div>
        )}

        <div className="flex flex-col">
          {filteredSessions.map((session, index) => (
            <div key={session.sessionId} className={index < filteredSessions.length - 1 ? 'border-b border-slate-100' : ''}>
              {/* Session Row */}
              <div
                className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors duration-200 hover:bg-slate-50 ${expandedSession === session.sessionId ? 'bg-slate-50' : 'bg-white'}`}
                onClick={() => toggleSession(session.sessionId)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 mb-1">
                      <span className="text-slate-500 font-normal mr-1">ID:</span>
                      {session.sessionId}
                    </div>
                    <div className="text-xs text-slate-500 flex gap-4 flex-wrap">
                      <span>Date: {new Date(session.lastEventAt).toLocaleString()}</span>
                      {session.pageUrl && (
                        <span>URL: <a href={session.pageUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-blue-500 hover:underline">{session.pageUrl.replace(API_URL, '') || session.pageUrl}</a></span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-800">{session.eventCount}</div>
                    <div className="text-[0.7rem] text-slate-500 uppercase">Events</div>
                  </div>
                  <div className="text-slate-400 text-xs">
                    {expandedSession === session.sessionId ? '▲' : '▼'}
                  </div>
                </div>
              </div>

              {/* Session Timeline Details */}
              {expandedSession === session.sessionId && (
                <div className="pl-6 md:pl-20 pr-6 md:pr-8 py-6 bg-slate-50 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5 ml-16 md:ml-20">Event Timeline</h4>
                  <div className="flex flex-col">
                    {sessionEvents[session.sessionId] ? (
                      sessionEvents[session.sessionId].map((evt, idx) => (
                        <div key={idx} className={`flex relative ${idx === sessionEvents[session.sessionId].length - 1 ? 'mb-0' : 'mb-6'}`}>

                          {/* Timestamp Block */}
                          <div className="w-16 shrink-0 text-right pr-4 text-slate-500 text-sm">
                            <div className="font-medium">{formatTimeInfo(evt.timestamp).time}</div>
                            <div className="text-xs">{formatTimeInfo(evt.timestamp).ampm}</div>
                          </div>

                          {/* Timeline Line & Dot */}
                          <div className="relative w-5 shrink-0 flex justify-center">
                            {/* Vertical Line */}
                            <div className={`absolute top-0 w-0.5 bg-slate-200 ${idx === sessionEvents[session.sessionId].length - 1 ? 'bottom-0' : '-bottom-6'}`}></div>

                            {/* Blue Dot */}
                            <div className="absolute top-1.5 w-2 h-2 rounded-full bg-blue-500 z-10"></div>
                          </div>

                          {/* Content Block */}
                          <div className="grow pl-4">
                            <div className="text-sm text-slate-900 font-semibold mb-1">
                              {getEventTitle(evt)}
                            </div>
                            {getEventDetail(evt) && (
                              <div className="text-sm text-slate-500">
                                {getEventDetail(evt)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-400 ml-16 md:ml-20">Loading timeline events...</div>
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
