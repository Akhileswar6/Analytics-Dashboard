(function() {
  const API_ENDPOINT = 'https://analytics-84z7.onrender.com';
  const STORAGE_KEY = 'user_session_id';
  const SESSION_START_KEY = 'user_session_start';

  function generateUUID() {
    return 'xxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getSession() {
    let sessionId = localStorage.getItem(STORAGE_KEY);
    let sessionStart = localStorage.getItem(SESSION_START_KEY);
    
    const now = Date.now();
    let isNewSession = false;

    if (sessionId && sessionStart) {
      const startTime = parseInt(sessionStart, 10);
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      if (now - startTime >= TWENTY_FOUR_HOURS) {
        isNewSession = true;
      }
    } else {
      isNewSession = true;
    }

    if (isNewSession) {
      sessionId = generateUUID();
      sessionStart = now.toString();
      localStorage.setItem(STORAGE_KEY, sessionId);
      localStorage.setItem(SESSION_START_KEY, sessionStart);
    }
    return { sessionId, sessionStart: parseInt(sessionStart, 10) };
  }

  const { sessionId, sessionStart } = getSession();


  function getPageName() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('product.html')) return 'product';
    if (path.includes('index.html') || path.endsWith('/demo/')) return 'home';
    return 'unknown';
  }

  const pageName = getPageName();


  function sendEvent(eventType, extraPayload = {}) {
    const payload = {
      sessionId: sessionId,
      eventType: eventType,
      pageUrl: window.location.href,
      pageName: pageName,
      timestamp: new Date().toISOString(),
      ...extraPayload
    };



    if (eventType === 'session_end' && navigator.sendBeacon) {
      navigator.sendBeacon(API_ENDPOINT, JSON.stringify(payload));
    } else {
      fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(err => console.error('Tracking error:', err));
    }
  }

  sendEvent('page_view');

  if (pageName === 'product') {
    const params = new URLSearchParams(window.location.search);
    const productName = params.get('title') || document.querySelector('h2')?.innerText || 'Unknown Product';
    const priceStr = params.get('price') || document.querySelector('.price')?.innerText || '0';
    const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
    
    sendEvent('product_view', { productName, price, productId: productName.toLowerCase().replace(/\s+/g, '-') });
  }

  document.addEventListener('click', function(event) {
    const target = event.target;
    const closestBtnOrLink = target.closest('button, a, .btn, .filter-chip');
    
    let payload = {
      x: event.clientX,
      y: event.clientY
    };

    if (closestBtnOrLink) {
      payload.elementType = closestBtnOrLink.tagName.toLowerCase();
      payload.elementText = closestBtnOrLink.innerText.trim() || closestBtnOrLink.title || 'icon';

      if (closestBtnOrLink.innerText.toLowerCase().includes('add to cart') || closestBtnOrLink.classList.contains('btn-cart')) {
        let productName, price;
        if (pageName === 'product') {
            const params = new URLSearchParams(window.location.search);
            productName = params.get('title') || document.querySelector('h2')?.innerText;
        } else {
            const card = closestBtnOrLink.closest('.product-card');
            if (card) {
                productName = card.querySelector('.product-title')?.innerText;
            }
        }
        if (productName) {
            sendEvent('add_to_cart', { productName, productId: productName.toLowerCase().replace(/\s+/g, '-') });
            return; 
        }
      }
      
     
      if (closestBtnOrLink.title?.toLowerCase().includes('wishlist') || closestBtnOrLink.innerText.includes('♡') || closestBtnOrLink.querySelector('[data-lucide="heart"]')) {
        let productName;
        if (pageName === 'product') {
            const params = new URLSearchParams(window.location.search);
            productName = params.get('title') || document.querySelector('h2')?.innerText;
        } else {
            const card = closestBtnOrLink.closest('.product-card');
            if (card) productName = card.querySelector('.product-title')?.innerText;
        }
        if (productName) {
            sendEvent('wishlist_add', { productName, productId: productName.toLowerCase().replace(/\s+/g, '-') });
            return;
        }
      }

     
      if (closestBtnOrLink.id === 'search-btn' || (closestBtnOrLink.previousElementSibling && closestBtnOrLink.previousElementSibling.classList.contains('search-bar'))) {
        const query = document.querySelector('.search-bar')?.value;
        if (query) {
          sendEvent('search', { query });
          return;
        }
      }

      if (closestBtnOrLink.id === 'login-btn' || closestBtnOrLink.innerText.toLowerCase().includes('log in') || closestBtnOrLink.innerText.toLowerCase() === 'login') {
        sendEvent('login_click', { elementText: 'Log In', elementType: 'button', x: payload.x, y: payload.y });
        return;
      }
      if (closestBtnOrLink.id === 'signup-btn' || closestBtnOrLink.innerText.toLowerCase().includes('sign up')) {
        sendEvent('signup_click', { elementText: 'Sign Up', elementType: 'button', x: payload.x, y: payload.y });
        return;
      }
    }

    sendEvent('click', payload);
  }, true);

  window.addEventListener('beforeunload', () => {
    const sessionDuration = Math.round((Date.now() - sessionStart) / 1000); // in seconds
    sendEvent('session_end', { sessionDuration });
  });

})();
