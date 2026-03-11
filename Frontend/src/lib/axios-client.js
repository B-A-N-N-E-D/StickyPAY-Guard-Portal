export const createAxiosClient = ({ baseURL = "", headers = {}, token } = {}) => {
  const baseHeaders = { ...headers };
  if (token) {
    baseHeaders.Authorization = `Bearer ${token}`;
  }

  const buildUrl = (path) => {
    const base = String(baseURL || "").replace(/\/$/, "");
    const suffix = String(path || "").replace(/^\//, "");
    return `${base}/${suffix}`;
  };

  const request = async (path, options = {}) => {
    const response = await fetch(buildUrl(path), {
      ...options,
      headers: { ...baseHeaders, ...(options.headers || {}) },
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => "");

    if (!response.ok) {
      const error = new Error((data && data.message) || response.statusText || "Request failed");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  };

  return {
    get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  };
};