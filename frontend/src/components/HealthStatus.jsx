import { useEffect, useState } from "react";
import api from "../services/api";

export default function HealthStatus() {
  const [health, setHealth] = useState({
    status: "loading",
    storage: "unknown",
    lastChecked: new Date().toISOString(),
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await api.getHealth();
        // API returns: {"status":"healthy","checks":{"storage":"ok"}}
        const storageStatus = data.checks?.storage || "unknown";
        setHealth({
          status: data.status === "healthy" ? "ok" : "degraded",
          storage: storageStatus,
          lastChecked: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Health check failed:", error);
        setHealth({
          status: "down",
          storage: "error",
          lastChecked: new Date().toISOString(),
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    ok: {
      bg: "bg-green-100",
      border: "border-green-400",
      text: "text-green-800",
      icon: "✅",
    },
    degraded: {
      bg: "bg-yellow-100",
      border: "border-yellow-400",
      text: "text-yellow-800",
      icon: "⚠️",
    },
    down: {
      bg: "bg-red-100",
      border: "border-red-400",
      text: "text-red-800",
      icon: "❌",
    },
    loading: {
      bg: "bg-blue-100",
      border: "border-blue-400",
      text: "text-blue-800",
      icon: "⏳",
    },
  };

  const config = statusConfig[health.status] || statusConfig.loading;

  return (
    <div className={`rounded-lg border-2 p-6 ${config.bg} ${config.border}`}>
      <h2 className={`mb-4 text-xl font-bold ${config.text}`}>Health Status</h2>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <span className={`text-lg font-semibold uppercase ${config.text}`}>
              {health.status}
            </span>
          </div>
          <div className={`text-sm ${config.text}`}>
            Storage: {health.storage}
          </div>
        </div>
        <div className={`text-sm ${config.text} opacity-75`}>
          Last checked: {new Date(health.lastChecked).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
