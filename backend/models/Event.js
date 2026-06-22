const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  eventType: {
    type: String,
    enum: ['page_view', 'click', 'product_view', 'add_to_cart', 'wishlist_add', 'search', 'checkout_started', 'order_placed', 'session_end', 'login_click', 'signup_click'],
    required: true
  },
  pageUrl: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  x: {
    type: Number,
    required: function() { return this.eventType === 'click'; }
  },
  y: {
    type: Number,
    required: function() { return this.eventType === 'click'; }
  },


  pageName: { type: String },
  productId: { type: String },
  productName: { type: String },
  price: { type: Number },
  query: { type: String },
  orderValue: { type: Number },
  elementText: { type: String },
  elementType: { type: String },
  sessionDuration: { type: Number }
});

module.exports = mongoose.model('Event', EventSchema);
