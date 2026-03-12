function getConfig(name, defaultValue = null) {
  // If inside a docker container, use window.ENV
  if (window.ENV !== undefined && window.ENV[name] !== undefined) {
    return window.ENV[name];
  }

  return import.meta.env[name] || defaultValue;
}

export function getBackendUrl() {
  let url = getConfig("VITE_BACKEND_URL");
  if (!url && window.ENV !== undefined) {
    url = window.ENV["REACT_APP_BACKEND_URL"];
  }
  return url || getConfig("REACT_APP_BACKEND_URL") || "http://localhost:8080/";
}

export function getHoursCloseTicketsAuto() {
  return getConfig("VITE_HOURS_CLOSE_TICKETS_AUTO");
}
