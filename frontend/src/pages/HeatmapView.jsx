import { useState, useEffect, useRef } from 'react';
import simpleheat from 'simpleheat';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const HOME_PAGE_NAME = 'home';


const PAGE_BACKGROUNDS = {
  'index.html': '/home-bg.png',
  'product.html': '/product-bg.png',
};
const DEFAULT_BG = '/home-bg.png';

function getBackgroundForUrl(url) {
  if (!url) return DEFAULT_BG;
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    for (const [pattern, bg] of Object.entries(PAGE_BACKGROUNDS)) {
      if (pathname.includes(pattern)) return bg;
    }
  } catch {
    for (const [pattern, bg] of Object.entries(PAGE_BACKGROUNDS)) {
      if (url.includes(pattern)) return bg;
    }
  }
  return DEFAULT_BG;
}

export default function HeatmapView() {
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [imgSize, setImgSize] = useState({ width: 1200, height: 800 });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bgError, setBgError] = useState(false);
  
  const [availableUrls, setAvailableUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [urlsLoading, setUrlsLoading] = useState(true);

  const canvasRef = useRef(null);

  const currentBg = getBackgroundForUrl(selectedUrl);

  useEffect(() => {
    async function fetchUrls() {
      setUrlsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/heatmap/urls`);
        if (!res.ok) throw new Error('Failed to fetch URLs');
        const urls = await res.json();
        setAvailableUrls(urls);
        if (urls.length > 0) {
          setSelectedUrl(urls[0]);
        }
      } catch (err) {
        console.error('Error fetching URLs:', err);
      } finally {
        setUrlsLoading(false);
      }
    }
    fetchUrls();
  }, []);

  useEffect(() => {
    setBgError(false);
  }, [selectedUrl]);

  const fetchHeatmap = async () => {
    setLoading(true);
    setError(null);
    setLoaded(false);
    try {
      let url;
      if (selectedUrl) {
        url = `${API_URL}/api/heatmap?pageUrl=${encodeURIComponent(selectedUrl)}&date=${selectedDate}`;
      } else {
        url = `${API_URL}/api/heatmap?pageName=${HOME_PAGE_NAME}&date=${selectedDate}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch heatmap data');
      const data = await res.json();
      setClicks(data);
      setLoaded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!urlsLoading) {
      fetchHeatmap();
    }
  }, [selectedDate, selectedUrl, urlsLoading]);

  useEffect(() => {
    if (loaded && canvasRef.current && clicks.length > 0) {
      const canvas = canvasRef.current;
      const heat = simpleheat(canvas);

      const data = clicks.map(c => {
        const vw = c.viewportWidth || 1920;
        const vh = c.viewportHeight || 1080;
        const nx = (c.x / vw) * imgSize.width;
        const ny = (c.y / vh) * imgSize.height;
        return [nx, ny, 1];
      });
      
      heat.data(data);
      const maxDensity = Math.max(5, Math.floor(clicks.length / 10));
      heat.max(maxDensity); 
      heat.radius(25, 15); 
      
      heat.gradient({
        0.3: 'blue',
        0.5: 'cyan',
        0.7: 'lime',
        0.9: 'yellow',
        1.0: 'red'
      });
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      heat.draw();
    } else if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [clicks, loaded, imgSize]);

  const getUrlLabel = (url) => {
    try {
      const parsed = new URL(url);
      const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      const tag = isLocal ? '🖥 Local' : '🌐 Production';
      const path = parsed.pathname === '/' ? '/' : parsed.pathname;
      return `${tag}  —  ${parsed.host}${path}`;
    } catch {
      return url;
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="m-0 text-2xl font-bold">Click Heatmap</h2>
          <p className="text-slate-500 mt-1">Visualize where users are clicking on your pages.</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm"
          />
          {loading && <span className="text-slate-500 text-sm">Loading...</span>}
          {loaded && !loading && (
            <span className="text-emerald-600 text-sm font-medium bg-emerald-500/10 px-4 py-2 rounded-full">
              ✓ {clicks.length} click{clicks.length !== 1 ? 's' : ''} loaded
            </span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">Page URL</span>
            </div>

            {urlsLoading ? (
              <span className="text-slate-400 text-sm">Loading URLs...</span>
            ) : availableUrls.length === 0 ? (
              <span className="text-slate-400 text-sm italic">No tracked URLs found — using default page.</span>
            ) : (
              <select
                value={selectedUrl}
                onChange={(e) => setSelectedUrl(e.target.value)}
                className="flex-1 min-w-0 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
              >
                {availableUrls.map((url) => (
                  <option key={url} value={url}>
                    {getUrlLabel(url)}
                  </option>
                ))}
              </select>
            )}

            {selectedUrl && (
              <a
                href={selectedUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:text-blue-700 text-xs shrink-0 transition-colors"
                title="Open URL in new tab"
              >
                ↗ Open
              </a>
            )}
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading && !loaded ? (
        <Loader text="Loading heatmap..." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-0 overflow-hidden shadow-sm">
          <div className="heatmap-container overflow-auto bg-slate-50 p-6 flex justify-center">
            <div className="relative inline-block max-w-full shadow-md border border-slate-200 bg-white">
              
              {bgError ? (
                <div 
                  className="flex flex-col items-center justify-center text-slate-400 bg-slate-100"
                  style={{ width: imgSize.width, height: imgSize.height, maxWidth: '100%' }}
                >
                  <div className="text-4xl mb-3">📸</div>
                  <div className="text-sm font-medium text-slate-500 mb-1">No screenshot available</div>
                  <div className="text-xs text-slate-400 text-center max-w-xs px-4">
                    Take a screenshot of <span className="font-mono text-slate-500">{selectedUrl ? new URL(selectedUrl).pathname : 'this page'}</span> and save it as <span className="font-mono text-blue-500">{currentBg.replace('/', '')}</span> in <span className="font-mono text-slate-500">frontend/public/</span>
                  </div>
                </div>
              ) : (
                <img 
                  src={currentBg}
                  alt="Page Background"
                  className="max-w-full h-auto block opacity-90 pt-7"
                  onLoad={(e) => {
                    setImgSize({ 
                      width: e.target.naturalWidth || 1200, 
                      height: e.target.naturalHeight || 800 
                    });
                  }}
                  onError={() => setBgError(true)}
                />
              )}

              <canvas 
                ref={canvasRef} 
                width={imgSize.width} 
                height={imgSize.height} 
                className={`absolute top-0 left-0 w-full h-full pointer-events-none z-10 ${clicks.length > 0 ? 'block' : 'hidden'}`}
              />
              
              {loaded && clicks.length === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500 text-center">
                  <div className="text-3xl mb-2">🖱️</div>
                  <div>No click data found for this date.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
