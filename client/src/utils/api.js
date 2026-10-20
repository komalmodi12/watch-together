const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

let cached = null;  // the feed, once loaded (kept while the tab stays open)
let pending = null; // a request that is already running, shared by every caller

// Three components ask for the feed when Home loads, but only ONE request is sent
export function fetchTrending() {
  if (cached) return Promise.resolve(cached);

  if (!pending) {
    pending = fetch(`${SERVER_URL}/api/trending`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server answered ${res.status}`);
        return res.json();
      })
      .then((data) => {
        cached = data; // a failure is NOT cached, so the next visit tries again
        return data;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}