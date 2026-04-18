import axios from "axios";
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
});

const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/logout", "/gettoken"];
let lastUnauthorizedEventAt = 0;

const shouldEmitUnauthorizedEvent = (url = "") => {
  return !AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    if (status === 401 && shouldEmitUnauthorizedEvent(requestUrl)) {
      const now = Date.now();
      if (now - lastUnauthorizedEventAt > 1000) {
        lastUnauthorizedEventAt = now;
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("app:unauthorized", {
              detail: { status, requestUrl },
            })
          );
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;