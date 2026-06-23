const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Event = require('./models/Event');

const app = express();
const PORT = process.env.PORT

app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/plain' })); 

const path = require('path');
app.use('/demo', express.static(path.join(__dirname, '../demo')));

const MONGODB_URI = process.env.MONGODB_URI 
mongoose.connect(MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.post('/api/track', async (req, res) => {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { 
      sessionId, eventType, pageUrl, timestamp, x, y,
      pageName, productId, productName, price, query, 
      orderValue, elementText, elementType, sessionDuration
    } = body;
    
    if (!sessionId || !eventType || !pageUrl || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const event = new Event({
      sessionId, eventType, pageUrl, timestamp: new Date(timestamp),
      x, y, pageName, productId, productName, price, query, 
      orderValue, elementText, elementType, sessionDuration
    });

    await event.save();
    res.status(201).json({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      { $sort: { timestamp: 1 } },
      {
        $group: {
          _id: '$sessionId',
          eventCount: { $sum: 1 },
          lastEventAt: { $max: '$timestamp' },
          firstEventAt: { $min: '$timestamp' },
          pageUrl: { $first: '$pageUrl' }
        }
      },
      { $sort: { lastEventAt: -1 } }
    ]);
    
    const formattedSessions = sessions.map(s => ({
      sessionId: s._id,
      eventCount: s.eventCount,
      lastEventAt: s.lastEventAt,
      firstEventAt: s.firstEventAt,
      durationMs: s.lastEventAt - s.firstEventAt,
      pageUrl: s.pageUrl
    }));

    res.json(formattedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sessions/:sessionId/events', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const events = await Event.find({ sessionId }).sort({ timestamp: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching session events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/heatmap', async (req, res) => {
  try {
    const { pageUrl } = req.query;
    
    if (!pageUrl) {
      return res.status(400).json({ error: 'pageUrl query parameter is required' });
    }

    const clicks = await Event.find({
      pageUrl: pageUrl,
      eventType: 'click'
    }).select('x y timestamp -_id');

    res.json(clicks);
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/stats/overview', async (req, res) => {
  try {
    const totalSessions = (await Event.distinct('sessionId')).length;
    const totalEvents = await Event.countDocuments();
    const productsViewed = await Event.countDocuments({ eventType: 'product_view' });
    const ordersPlaced = await Event.countDocuments({ eventType: 'order_placed' });
    
    const sessionsData = await Event.aggregate([
      {
        $group: {
          _id: "$sessionId",
          firstEvent: { $min: "$timestamp" },
          lastEvent: { $max: "$timestamp" }
        }
      }
    ]);
    
    let avgSessionTime = 0;
    if (sessionsData.length > 0) {
      const totalDuration = sessionsData.reduce((acc, s) => {
        return acc + (new Date(s.lastEvent).getTime() - new Date(s.firstEvent).getTime());
      }, 0);
      avgSessionTime = Math.round((totalDuration / sessionsData.length) / 1000);
    }

    res.json({ totalSessions, totalEvents, productsViewed, ordersPlaced, avgSessionTime });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/stats/products', async (req, res) => {
  try {
    const getTopProducts = async (eventType) => {
      return await Event.aggregate([
        { $match: { eventType, productName: { $exists: true, $ne: null } } },
        { $group: { _id: '$productName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
    };

    const mostViewed = await getTopProducts('product_view');
    const topAdded = await getTopProducts('add_to_cart');
    const mostWishlisted = await getTopProducts('wishlist_add');

    res.json({ mostViewed, topAdded, mostWishlisted });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/stats/behavior', async (req, res) => {
  try {
    const mostVisitedPages = await Event.aggregate([
      { $match: { eventType: 'page_view', pageName: { $exists: true, $ne: null } } },
      { $group: { _id: '$pageName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const mostClickedElements = await Event.aggregate([
      { $match: { eventType: 'click', elementText: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$elementText', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const popularSearches = await Event.aggregate([
      { $match: { eventType: 'search', query: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({ mostVisitedPages, mostClickedElements, popularSearches });
  } catch (error) {
    console.error('Error fetching behavior stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
