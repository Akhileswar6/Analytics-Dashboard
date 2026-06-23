# Analytics Tracker & Dashboard

A full-stack project for tracking user behavior on a website and visualizing the data through an analytics dashboard. The project consists of a tracking script, a Node.js backend, and a React frontend.

## Tech Stack

- **Frontend**: React.js (Vite), CSS Modules/Vanilla CSS, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Tracking Demo**: Vanilla JavaScript, HTML/CSS

## Features

- **Event Tracking**: Captures page views, clicks, product views, add-to-cart, wishlist actions, checkout flows, and custom events like login/signup clicks.
- **Session Tracking**: Links events to unique user sessions using local storage.
- **Analytics Dashboard**: Visualizes conversion funnels, top products, most visited pages, and session KPIs.
- **Session Explorer**: Drill down into individual user sessions and view the chronological timeline of events, including exact click coordinates.
- **Heatmap Viewer**: Visual representation of user clicks across different pages.

## Setup Steps

### Prerequisites
- Node.js installed
- MongoDB connection string

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your MongoDB connection URI and desired port:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Demo Application
The demo e-commerce site used for generating tracking data is automatically served by the backend server. 
You can access it by navigating to:
`http://localhost:5000/demo/index.html`

## Assumptions & Trade-offs

1. **Session Identification**: Sessions are identified using a generated UUID stored in the browser's `localStorage`. This means tracking is tied to a specific browser and device, and clearing browser data will result in a new session being created. 
2. **Hardcoded API Endpoints**: The frontend dashboard and the tracking script (`tracker.js`) currently have the API endpoint hardcoded to `http://localhost:5000`. In a production environment, this should be managed via environment variables.
3. **Event Delivery**: Standard `fetch` is used for most tracking events. If a user quickly navigates away from a page, an event might be dropped. The `session_end` event uses `navigator.sendBeacon` to mitigate this issue during page unloads.
4. **Heatmap Accuracy**: Click coordinates (`x` and `y`) are captured relative to the viewport. Because different users have varying screen sizes and device types, overlaying these coordinates on a static background image might result in slight visual inaccuracies for responsive layouts.
5. **No Authentication**: The analytics dashboard currently has no authentication layer and is publicly accessible. In a real-world scenario, this route would need to be protected.
