"use client";

import { useEffect, useState } from "react";

type LogEntry = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
  actor: { name: string; email: string };
};

export function AuditLogViewer({ gate }: { gate: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/${gate}/api/audit`)
      .then((res) => res.json())
      .then((data) => setLogs(data.logs ?? []))
      .finally(() => setLoading(false));
  }, [gate]);

  return (
    <div className="admin-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#F8F9FA] text-left text-xs text-[#6C757D]">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Qui</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Cible</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t border-[#E9ECEF]">
              <td className="px-4 py-3 text-[#6C757D]">
                {new Date(log.createdAt).toLocaleString("fr-FR")}
              </td>
              <td className="px-4 py-3">{log.actor.name}</td>
              <td className="px-4 py-3">{log.action}</td>
              <td className="px-4 py-3 text-[#6C757D]">
                {log.targetType ? `${log.targetType} ${log.targetId?.slice(-8) ?? ""}` : "—"}
              </td>
            </tr>
          ))}
          {!loading && logs.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-[#6C757D]">
                Aucune action enregistrée pour l&apos;instant.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
