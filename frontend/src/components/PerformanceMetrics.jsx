import { useEffect, useState } from "react";

export default function PerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    requests: 0,
    successes: 0,
    failures: 0,
    avgResponseTime: 0,
    responseTimes: [],
  });

  // Track API performance
  useEffect(() => {
    const originalFetch = window.fetch;
    let requestCount = 0;
    let successCount = 0;
    let failureCount = 0;
    let responseTimes = [];

    window.fetch = async function (...args) {
      const startTime = performance.now();
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url;

      // Only track API requests
      if (!url?.includes("localhost:3000") && !url?.includes("/api")) {
        return originalFetch.apply(window, args);
      }

      requestCount++;

      try {
        const response = await originalFetch.apply(window, args);
        const duration = Math.round(performance.now() - startTime);

        if (response.ok) {
          successCount++;
        } else {
          failureCount++;
        }

        responseTimes = [...responseTimes.slice(-19), duration];
        const avgTime = Math.round(
          responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        );

        setMetrics({
          requests: requestCount,
          successes: successCount,
          failures: failureCount,
          avgResponseTime: avgTime,
          responseTimes: [...responseTimes],
        });

        return response;
      } catch (error) {
        failureCount++;
        const duration = Math.round(performance.now() - startTime);
        responseTimes = [...responseTimes.slice(-19), duration];

        setMetrics({
          requests: requestCount,
          successes: successCount,
          failures: failureCount,
          avgResponseTime: Math.round(
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
          ),
          responseTimes: [...responseTimes],
        });

        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const successRate =
    metrics.requests > 0
      ? Math.round((metrics.successes / metrics.requests) * 100)
      : 100;

  return (
    <div className="rounded-lg border border-green-300 bg-white p-6">
      <h2 className="mb-4 text-xl font-bold text-gray-800">
        Performance Metrics
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded bg-blue-50 p-3 text-center">
          <div className="text-2xl font-bold text-blue-700">
            {metrics.requests}
          </div>
          <div className="text-xs text-blue-600">Total Requests</div>
        </div>
        <div className="rounded bg-green-50 p-3 text-center">
          <div className="text-2xl font-bold text-green-700">
            {successRate}%
          </div>
          <div className="text-xs text-green-600">Success Rate</div>
        </div>
        <div className="rounded bg-purple-50 p-3 text-center">
          <div className="text-2xl font-bold text-purple-700">
            {metrics.avgResponseTime}ms
          </div>
          <div className="text-xs text-purple-600">Avg Response</div>
        </div>
        <div className="rounded bg-red-50 p-3 text-center">
          <div className="text-2xl font-bold text-red-700">
            {metrics.failures}
          </div>
          <div className="text-xs text-red-600">Failures</div>
        </div>
      </div>

      {/* Simple bar chart of recent response times */}
      <div className="mt-4">
        <div className="text-xs text-gray-500 mb-1">Recent Response Times</div>
        <div className="flex items-end gap-1 h-16">
          {metrics.responseTimes.length === 0 ? (
            <div className="text-gray-400 text-xs">No data yet</div>
          ) : (
            metrics.responseTimes.map((time, i) => {
              const height = Math.min((time / 1000) * 100, 100);
              return (
                <div
                  key={i}
                  className="flex-1 bg-green-500 rounded-t transition-all"
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${time}ms`}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
