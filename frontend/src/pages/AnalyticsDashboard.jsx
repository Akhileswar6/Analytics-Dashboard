import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState(null);
  const [behavior, setBehavior] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resOverview, resProducts, resBehavior] = await Promise.all([
          fetch(`${API_URL}/api/stats/overview`),
          fetch(`${API_URL}/api/stats/products`),
          fetch(`${API_URL}/api/stats/behavior`),
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
      <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">
        Loading data...
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total Sessions', value: (overview?.totalSessions || 0).toLocaleString(), bg: 'bg-blue-100', color: 'text-blue-700' },
    { label: 'Total Events', value: (overview?.totalEvents || 0).toLocaleString(), bg: 'bg-violet-100', color: 'text-violet-700' },
    { label: 'Products Viewed', value: (overview?.productsViewed || 0).toLocaleString(), bg: 'bg-orange-100', color: 'text-orange-700' },
    { label: 'Avg. Session Time', value: formatTime(overview?.avgSessionTime || 0), bg: 'bg-green-100', color: 'text-green-700' },
  ];

  const tableCards = [
    {
      title: 'Most Viewed Products',
      items: products?.mostViewed,
      color: 'text-blue-700',
      bg: 'bg-blue-100',
      empty: 'No product views tracked yet.',
    },
    {
      title: 'Most Added to Cart',
      items: products?.topAdded,
      color: 'text-violet-700',
      bg: 'bg-violet-100',
      empty: 'No cart events tracked yet.',
    },
    {
      title: 'Most Wishlisted',
      items: products?.mostWishlisted,
      color: 'text-rose-700',
      bg: 'bg-rose-100',
      empty: 'No wishlist events tracked yet.',
    },
    {
      title: 'Most Clicked Elements',
      items: behavior?.mostClickedElements,
      color: 'text-orange-700',
      bg: 'bg-orange-100',
      empty: 'No click events tracked yet.',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900 m-0">Analytics Overview</h2>
        <p className="text-slate-500 text-xs mt-1">
          Real-time behavioral analytics from your demo store.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-5 border border-black/5`}>
            <p className={`text-[0.72rem] font-semibold ${card.color} uppercase tracking-wider mb-2`}>
              {card.label}
            </p>
            <p className="text-3xl font-extrabold text-slate-900 leading-none mb-1">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {tableCards.map((card) => (
          <div key={card.title} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Card Header */}
            <div className={`${card.bg} px-5 py-3.5 border-b border-black/5`}>
              <p className={`text-xs font-bold ${card.color} uppercase tracking-wider m-0`}>{card.title}</p>
            </div>
            {/* Card Body */}
            <div className="py-2">
              {card.items?.length ? card.items.map((item, i) => (
                <div key={i} className={`flex items-center justify-between px-5 py-2.5 ${i < card.items.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-[22px] h-[22px] rounded-full ${card.bg} ${card.color} text-[0.7rem] font-bold flex items-center justify-center shrink-0`}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {card.isSearch ? `"${item._id}"` : item._id}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold ${card.color} ${card.bg} px-2.5 py-1 rounded-full`}>
                    {item.count}
                  </span>
                </div>
              )) : (
                <p className="px-5 py-6 text-xs text-slate-400 italic m-0">{card.empty}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
