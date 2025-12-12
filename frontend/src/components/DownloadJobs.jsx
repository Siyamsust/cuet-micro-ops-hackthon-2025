import { useState } from "react";
import api from "../services/api";
import { captureException } from "../sentry";

export default function DownloadJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileId, setFileId] = useState("10000");

  const initiateDownload = async () => {
    setLoading(true);
    try {
      const id = parseInt(fileId);
      if (id < 10000 || id > 100000000) {
        alert("File ID must be between 10000 and 100000000");
        return;
      }

      const result = await api.initiateDownload([id]);

      const job = {
        jobId: result.jobId || `job-${Date.now()}`,
        fileIds: [id],
        status: "queued",
        progress: 0,
        timestamp: new Date().toISOString(),
      };

      setJobs((prev) => [job, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error("Failed to initiate download:", error);
      captureException(error, { fileId });
      alert("Failed to initiate download: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    queued: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6">
      <h2 className="mb-4 text-xl font-bold text-gray-800">Download Jobs</h2>

      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          <input
            type="number"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            placeholder="File ID (10000-100000000)"
            className="flex-1 rounded border border-gray-300 px-3 py-2 font-mono"
            min="10000"
            max="100000000"
          />
          <button
            onClick={initiateDownload}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "..." : "Download"}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Use 70000 to trigger Sentry test error
        </p>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-sm">No downloads initiated yet</p>
        ) : (
          jobs.map((job) => (
            <div key={job.jobId} className="rounded border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-gray-600">
                  {job.jobId.substring(0, 20)}...
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${statusColors[job.status]}`}
                >
                  {job.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Files: {job.fileIds.join(", ")} |{" "}
                {new Date(job.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
