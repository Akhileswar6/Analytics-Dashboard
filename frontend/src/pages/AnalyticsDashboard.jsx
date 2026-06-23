import { useEffect, useState } from 'react';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState(null);
  const [behavior, setBehavior] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resOverview, resProducts, resBehavior] = await Promise.all([
          fetch('http://localhost:5000/api/stats/overview'),
          fetch('http://localhost:5000/api/stats/products'),
          fetch('http://localhost:5000/api/stats/behavior'),
        ]);
        setOverview(await resOverview.json());
        setProducts(await resProducts.json());
        setBehavior(await resBehavior.json());
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatTime = (seconds) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#94a3b8', fontSize: '0.9rem' }}>
        Loading data...
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total Sessions', value: (overview?.totalSessions || 0).toLocaleString(), bg: '#dbeafe', color: '#1d4ed8' },
    { label: 'Total Events', value: (overview?.totalEvents || 0).toLocaleString(),bg: '#ede9fe', color: '#6d28d9' },
    { label: 'Products Viewed', value: (overview?.productsViewed || 0).toLocaleString(), bg: '#ffedd5', color: '#c2410c' },
    { label: 'Avg. Session Time', value: formatTime(overview?.avgSessionTime || 0), bg: '#dcfce7', color: '#15803d' },
  ];

  const tableCards = [
    {
      title: 'Most Viewed Products',
      items: products?.mostViewed,
      color: '#1d4ed8',
      bg: '#dbeafe',
      empty: 'No product views tracked yet.',
    },
    {
      title: 'Most Added to Cart',
      items: products?.topAdded,
      color: '#6d28d9',
      bg: '#ede9fe',
      empty: 'No cart events tracked yet.',
    },
    {
      title: 'Most Wishlisted',
      items: products?.mostWishlisted,
      color: '#be123c',
      bg: '#ffe4e6',
      empty: 'No wishlist events tracked yet.',
    },
    {
      title: 'Most Clicked Elements',
      items: behavior?.mostClickedElements,
      color: '#c2410c',
      bg: '#ffedd5',
      empty: 'No click events tracked yet.',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Analytics Overview</h2>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
          Real-time behavioral analytics from your demo store.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {kpiCards.map((card) => (
          <div key={card.label} style={{
            background: card.bg,
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, color: card.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              {card.label}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '0.3rem' }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {tableCards.map((card) => (
          <div key={card.title} style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {/* Card Header */}
            <div style={{ background: card.bg, padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{card.title}</p>
            </div>
            {/* Card Body */}
            <div style={{ padding: '0.5rem 0' }}>
              {card.items?.length ? card.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 1.25rem',
                  borderBottom: i < card.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: card.bg, color: card.color,
                      fontSize: '0.7rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>{i + 1}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>
                      {card.isSearch ? `"${item._id}"` : item._id}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: card.color,
                    background: card.bg,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                  }}>{item.count}</span>
                </div>
              )) : (
                <p style={{ padding: '1.5rem 1.25rem', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>{card.empty}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
