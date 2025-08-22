export default function RecordTracking({ logs }) {
  if (!logs?.length) return <p className="text-sm text-gray-500">No activity log.</p>;
  return (
    <div className="mt-3 p-3 rounded-lg border bg-gray-50 text-sm space-y-1">
      {logs.map((log, i) => (
        <div key={i} className="flex justify-between">
          <span>
            <strong>{log.action}</strong> by {log.byUserName} ({log.byUserId})
          </span>
          <span className="text-gray-500">{new Date(log.at).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
