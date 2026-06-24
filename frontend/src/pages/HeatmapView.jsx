import { useState, useEffect, useRef } from 'react';
import simpleheat from 'simpleheat';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const HOME_PAGE_NAME = 'home';
const BG_IMAGE = '/home-bg.png';

export default function HeatmapView() {
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [imgSize, setImgSize] = useState({ width: 1200, height: 800 });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const canvasRef = useRef(null);

  const fetchHeatmap = async () => {
    setLoading(true);
    setError(null);
    setLoaded(false);
    try {
      const res = await fetch(`${API_URL}/api/heatmap?pageName=${HOME_PAGE_NAME}&date=${selectedDate}`);
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

  // Auto-fetch on mount and when date changes
  useEffect(() => {
    fetchHeatmap();
  }, [selectedDate]);

  useEffect(() => {
    if (loaded && canvasRef.current && clicks.length > 0) {
      const canvas = canvasRef.current;
      const heat = simpleheat(canvas);

      // Scale raw pixel coordinates from the user's viewport to the image dimensions
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

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="m-0 text-2xl font-bold">Click Heatmap</h2>
          <p className="text-slate-500 mt-1">Visualize where users are clicking on your homepage.</p>
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

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading && !loaded ? (
        <Loader text="Loading heatmap..." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-0 overflow-hidden shadow-sm">
          <div className="heatmap-container overflow-auto bg-slate-50 p-6 flex justify-center">
            <div className="relative inline-block max-w-full shadow-md border border-slate-200 bg-white">
              <img 
                src={BG_IMAGE}
                alt="Demo Page Background"
                className="max-w-full h-auto block opacity-90 pt-7"
                onLoad={(e) => {
                  setImgSize({ 
                    width: e.target.naturalWidth || 1200, 
                    height: e.target.naturalHeight || 800 
                  });
                }}
              />

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
