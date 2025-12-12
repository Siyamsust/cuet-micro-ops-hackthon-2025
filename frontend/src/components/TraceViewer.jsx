import { useState, useEffect } from "react";

export default function TraceViewer({ jaegerUrl }) {
  const [traces, setTraces] = useState([]);

  // Intercept fetch to capture traces
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
      const startTime = performance.now();
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url;

      try {
        const response = await originalFetch.apply(window, args);
        const duration = Math.round(performance.now() - startTime);

        // Don't log internal requests
        if (!url?.includes("localhost:16686")) {
          const trace = {
            id: `trace-${Date.now()}`,
            traceId: Math.random().toString(16).substring(2, 34),
            url: url?.split("?")[0] || "unknown",
            method: args[1]?.method || "GET",
            status: response.status,
            duration,
            success: response.ok,
            timestamp: new Date().toISOString(),
          };
          setTraces((prev) => [trace, ...prev.slice(0, 29)]);
        }

        return response;
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const trace = {
          id: `trace-${Date.now()}`,
          traceId: Math.random().toString(16).substring(2, 34),
          url: url?.split("?")[0] || "unknown",
          method: args[1]?.method || "GET",
          status: 0,
          duration,
          success: false,
          timestamp: new Date().toISOString(),
        };
        setTraces((prev) => [trace, ...prev.slice(0, 29)]);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <div className="rounded-lg border border-purple-300 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Trace Viewer</h2>
        <a
          href={jaegerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
        >
          Open Jaeger UI
        </a>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {traces.length === 0 ? (
          <p className="text-gray-500 text-sm">No traces captured yet</p>
        ) : (
          traces.map((trace) => (
            <div
              key={trace.id}
              className={`rounded border-l-4 p-2 text-sm ${
                trace.success
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {trace.method} {trace.url.split("/").slice(-2).join("/")}
                </span>
                <span
                  className={`font-mono text-xs ${trace.success ? "text-green-700" : "text-red-700"}`}
                >
                  {trace.status} | {trace.duration}ms
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-mono">
                  trace: {trace.traceId.substring(0, 16)}
                </span>
                <span className="ml-2">
                  {new Date(trace.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
