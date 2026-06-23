import { useState, useEffect, useRef } from 'react';
import simpleheat from 'simpleheat';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Map pages to their corresponding background images (user can add these to the public folder)
const HOME_PAGE_URL = `${API_URL}/demo/index.html`;
const BG_IMAGE = '/home-bg.png';

export default function HeatmapView() {
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  
  const canvasRef = useRef(null);

  const fetchHeatmap = async () => {
    setLoading(true);
    setError(null);
    setLoaded(false);
    try {
      const res = await fetch(`${API_URL}/api/heatmap?pageUrl=${encodeURIComponent(HOME_PAGE_URL)}`);
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

  // Auto-fetch on mount
  useEffect(() => {
    fetchHeatmap();
  }, []);

  useEffect(() => {
    if (loaded && canvasRef.current && clicks.length > 0) {
      const canvas = canvasRef.current;
      const heat = simpleheat(canvas);
      
      // We set value to 1 for each click
      const data = clicks.map(c => [c.x, c.y, 1]);
      
      heat.data(data);
      // Dynamically calculate max based on click volume so it looks professional
      // A single click will be cool, while clusters will turn red
      const maxDensity = Math.max(5, Math.floor(clicks.length / 10));
      heat.max(maxDensity); 
      // Set a professional radius and blur that creates smooth blobs
      heat.radius(25, 15); 
      
      // We explicitly define the gradient colors for a standard hot/cold look
      heat.gradient({
        0.3: 'blue',
        0.5: 'cyan',
        0.7: 'lime',
        0.9: 'yellow',
        1.0: 'red'
      });
      
      // Clear canvas before drawing
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      heat.draw();
    } else if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [clicks, loaded]);

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Click Heatmap</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Visualize where users are clicking on your homepage.</p>
        </div>
        <div>
          {loading && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</span>}
          {loaded && !loading && (
            <span style={{ color: 'var(--success-color)', fontSize: '0.9rem', fontWeight: 500, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
              ✓ {clicks.length} click{clicks.length !== 1 ? 's' : ''} loaded
            </span>
          )}
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{error}</p>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="heatmap-container" style={{ 
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          position: 'relative', 
          background: '#f8fafc',
          height: 'auto' // Let height scale automatically based on canvas aspect ratio
        }}>
          
          {/* This is where the background image goes! */}
          {clicks.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${BG_IMAGE})`,
              // Using 100% 100% guarantees the image stretches exactly across the bounds of the heatmap canvas
              backgroundSize: '100% 100%', 
              backgroundPosition: 'top left',
              backgroundRepeat: 'no-repeat',
              opacity: 0.9
            }} />
          )}

          <canvas 
            ref={canvasRef} 
            width={1200} 
            height={800} 
            style={{ 
              display: clicks.length > 0 ? 'block' : 'none', 
              width: '100%', // Scale width to 100% of container
              height: 'auto', // Preserve aspect ratio
              objectFit: 'contain', 
              background: 'transparent',
              position: 'relative',
              zIndex: 10
            }} 
          />
          
          {loaded && clicks.length === 0 && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-muted)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖱️</div>
              <div>No click data found yet.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
