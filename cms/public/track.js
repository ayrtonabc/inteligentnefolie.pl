/*!
 * CMS Website Analytics (Supabase)
 * Lightweight, framework-agnostic pageview tracker.
 * Usage:
 *  <script src="/track.js"
 *          data-supabase-url="https://qwptdtysihhhtwnvsktp.supabase.co"
 *          data-supabase-key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3cHRkdHlzaWhoaHR3bnZza3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNjEwNTMsImV4cCI6MjA5MDczNzA1M30.9vQ8bdWpp-Nr7cy_Sn6LTMKzl4ONkzRxQWlQzRZpKk8"
 *          data-auto-route="true"></script>
 * Then, in SPA you can also call:
 *  window.CMSAnalytics.trackPage('/custom-path')
 */
(function () {
  var SCRIPT_TAG = (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1] || null;
  })();

  var CONF = {
    url:
      (SCRIPT_TAG && SCRIPT_TAG.getAttribute('data-supabase-url')) ||
      (window.CMS_TRACK_CONFIG && window.CMS_TRACK_CONFIG.SUPABASE_URL) ||
      '',
    key:
      (SCRIPT_TAG && SCRIPT_TAG.getAttribute('data-supabase-key')) ||
      (window.CMS_TRACK_CONFIG && window.CMS_TRACK_CONFIG.SUPABASE_KEY) ||
      '',
    autoRoute:
      (SCRIPT_TAG && SCRIPT_TAG.getAttribute('data-auto-route')) === 'true' ||
      (window.CMS_TRACK_CONFIG && !!window.CMS_TRACK_CONFIG.AUTO_ROUTE) ||
      false,
  };

  function postJson(url, key, body) {
    return fetch(url, {
      method: 'POST',
      headers: {
        apikey: key,
        authorization: 'Bearer ' + key,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      keepalive: true,
    });
  }

  function detectDevice() {
    var ua = navigator.userAgent.toLowerCase();
    if (/mobile|iphone|android/.test(ua)) return 'mobile';
    if (/ipad|tablet/.test(ua)) return 'tablet';
    return 'desktop';
  }

  function detectBrowser() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('edg') > -1) return 'edge';
    if (ua.indexOf('opr') > -1 || ua.indexOf('opera') > -1) return 'opera';
    if (ua.indexOf('chrome') > -1) return 'chrome';
    if (ua.indexOf('safari') > -1 && ua.indexOf('chrome') === -1) return 'safari';
    if (ua.indexOf('firefox') > -1) return 'firefox';
    return 'other';
  }

  function getSessionId() {
    try {
      var key = '_cms_vid';
      var sid = localStorage.getItem(key);
      if (!sid) {
        sid = Date.now().toString(36) + Math.random().toString(36).slice(2);
        localStorage.setItem(key, sid);
      }
      return sid;
    } catch (e) {
      return null;
    }
  }

  function wasSeenRecently(pathname) {
    try {
      var key = '_cms_seen_' + pathname;
      var last = localStorage.getItem(key);
      var now = Date.now();
      if (!last || now - Number(last) > 24 * 60 * 60 * 1000) {
        localStorage.setItem(key, String(now));
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function trackPage(pathOverride) {
    if (!CONF.url || !CONF.key) return;
    var path = pathOverride || location.pathname || '/';
    var insertUrl = CONF.url.replace(/\/+$/, '') + '/rest/v1/website_visits';
    var unique = !wasSeenRecently(path);
    var body = {
      visited_at: new Date().toISOString(),
      path: path,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent || null,
      device_type: detectDevice(),
      browser: detectBrowser(),
      is_unique: unique,
      session_id: getSessionId(),
    };
    postJson(insertUrl, CONF.key, body).catch(function () {});
  }

  function patchHistory() {
    if (!('pushState' in history)) return;
    var origPush = history.pushState;
    var origReplace = history.replaceState;
    function onChange() {
      trackPage();
    }
    history.pushState = function () {
      var r = origPush.apply(this, arguments);
      onChange();
      return r;
    };
    history.replaceState = function () {
      var r = origReplace.apply(this, arguments);
      onChange();
      return r;
    };
    window.addEventListener('popstate', onChange);
  }

  window.CMSAnalytics = window.CMSAnalytics || {
    init: function (cfg) {
      CONF.url = cfg && cfg.url ? cfg.url : CONF.url;
      CONF.key = cfg && cfg.key ? cfg.key : CONF.key;
      if (cfg && typeof cfg.autoRoute === 'boolean') CONF.autoRoute = cfg.autoRoute;
    },
    trackPage: trackPage,
  };

  // Auto init
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    trackPage();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      trackPage();
    }, { once: true });
  }
  if (CONF.autoRoute) patchHistory();
})();

