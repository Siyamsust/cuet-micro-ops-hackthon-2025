import axios from "axios";
import { generateTraceId, captureException } from "../sentry";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 130000, // 130 seconds for long-running downloads
});

// Add trace context to all requests
apiClient.interceptors.request.use((config) => {
  const traceId = generateTraceId();
  const spanId = traceId.substring(0, 16);

  // W3C Trace Context header
  config.headers["traceparent"] = `00-${traceId}-${spanId}-01`;
  config.headers["X-Trace-ID"] = traceId;

  // Store trace ID for correlation
  config.metadata = { traceId, startTime: Date.now() };

  return config;
});

// Log responses and errors
apiClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(
      `[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`,
    );
    return response;
  },
  (error) => {
    const traceId = error.config?.metadata?.traceId;
    captureException(error, { traceId, url: error.config?.url });
    throw error;
  },
);

export const api = {
  // Health check
  async getHealth() {
    const { data } = await apiClient.get("/health");
    return data;
  },

  // Initiate download
  async initiateDownload(fileIds) {
    const { data } = await apiClient.post("/v1/download/initiate", {
      file_ids: fileIds,
    });
    return data;
  },

  // Check file availability
  async checkDownload(fileId) {
    const { data } = await apiClient.post(
      `/v1/download/check?file_id=${fileId}`,
    );
    return data;
  },

  // Start download (long-running)
  async startDownload(fileId) {
    const { data } = await apiClient.post(
      `/v1/download/start?file_id=${fileId}`,
    );
    return data;
  },
};

export default api;
