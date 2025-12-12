import * as Sentry from "@sentry/react";
import HealthStatus from "./components/HealthStatus";
import DownloadJobs from "./components/DownloadJobs";
import ErrorLog from "./components/ErrorLog";
import TraceViewer from "./components/TraceViewer";
import PerformanceMetrics from "./components/PerformanceMetrics";

function ErrorFallback({ error }) {
  return (
    <div className="rounded-lg border-4 border-red-600 bg-red-50 p-8 m-4">
      <h1 className="mb-4 text-3xl font-bold text-red-800">
        Something went wrong
      </h1>
      <p className="mb-4 text-red-700">{error?.message || "Unknown error"}</p>
      <button
        onClick={() => window.location.reload()}
        className="rounded bg-red-600 px-6 py-2 text-white hover:bg-red-700"
      >
        Reload Page
      </button>
    </div>
  );
}

function Dashboard() {
  const jaegerUrl =
    import.meta.env.VITE_JAEGER_UI_URL || "http://localhost:16686";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">
            Download Service Dashboard
          </h1>
          <p className="text-lg text-gray-300">
            Real-time monitoring with Sentry &amp; OpenTelemetry
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="space-y-6">
          {/* Row 1: Health Status */}
          <HealthStatus />

          {/* Row 2: Download Jobs and Error Log */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DownloadJobs />
            <ErrorLog />
          </div>

          {/* Row 3: Trace Viewer and Performance Metrics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TraceViewer jaegerUrl={jaegerUrl} />
            <PerformanceMetrics />
          </div>

          {/* Debug Info Footer */}
          <div className="rounded-lg border border-gray-600 bg-gray-800 p-4 text-gray-300">
            <h3 className="mb-2 font-bold">Configuration</h3>
            <div className="grid grid-cols-2 gap-2 text-sm font-mono">
              <div>
                API:{" "}
                {import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}
              </div>
              <div>Jaeger: {jaegerUrl}</div>
              <div>
                Sentry:{" "}
                {import.meta.env.VITE_SENTRY_DSN
                  ? "Configured"
                  : "Not configured"}
              </div>
              <div>Environment: {import.meta.env.MODE}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <Dashboard />
    </Sentry.ErrorBoundary>
  );
}

export default App;
