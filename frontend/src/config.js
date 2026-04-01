// Same hostname as the page (localhost vs 127.0.0.1) so the browser always hits a reachable API host.
const API_PORT = process.env.REACT_APP_API_PORT || "8080";

function getApiBaseUrl() {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
  }
  return `http://localhost:${API_PORT}`;
}

const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
