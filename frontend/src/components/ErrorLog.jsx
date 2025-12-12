import { useState, useEffect } from "react";

export default function ErrorLog() {
  const [errors, setErrors] = useState([]);

  // Listen for errors from window.onerror and unhandled rejections
  useEffect(() => {
    const handleError = (event) => {
      const error = {
        id: `err-${Date.now()}`,
        message: event.message || event.reason?.message || "Unknown error",
        timestamp: new Date().toISOString(),
        traceId: event.traceId || null,
        type: event.type || "error",
      };
      setErrors((prev) => [error, ...prev.slice(0, 19)]);
    };

    const handleRejection = (event) => {
      const error = {
        id: `rej-${Date.now()}`,
        message: event.reason?.message || "Unhandled promise rejection",
        timestamp: new Date().toISOString(),
        traceId: null,
        type: "unhandledrejection",
      };
      setErrors((prev) => [error, ...prev.slice(0, 19)]);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    // Expose addError for manual error logging
    window.__addError = (error) => {
      setErrors((prev) => [error, ...prev.slice(0, 19)]);
    };

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      delete window.__addError;
    };
  }, []);

  const clearErrors = () => setErrors([]);

  return (
    <div className="rounded-lg border border-red-300 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Error Log</h2>
        {errors.length > 0 && (
          <button
            onClick={clearErrors}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {errors.length === 0 ? (
          <p className="text-gray-500 text-sm">No errors captured</p>
        ) : (
          errors.map((error) => (
            <div
              key={error.id}
              className="rounded border-l-4 border-red-500 bg-red-50 p-3"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-sm text-red-800 break-all">
                  {error.message.substring(0, 100)}
                  {error.message.length > 100 && "..."}
                </span>
              </div>
              <div className="mt-1 flex gap-4 text-xs text-gray-500">
                <span>{new Date(error.timestamp).toLocaleTimeString()}</span>
                <span className="uppercase">{error.type}</span>
                {error.traceId && (
                  <span className="font-mono">
                    trace: {error.traceId.substring(0, 8)}...
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
