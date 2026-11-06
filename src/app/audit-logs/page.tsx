import { prisma } from "@/lib/prisma";
import { History, Shield, Filter, User, Calendar } from "lucide-react";
import { formatDateKolkata } from "@/lib/utils";

export default async function AuditLogsPage() {
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      changedByUser: true,
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">System Audit Trail & Accountability</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              Immutable Records
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Comprehensive chronological log of all changes across Question Bank, Master Data, Examinations, and Deployments.
          </p>
        </div>
      </div>

      {/* Audit Log Table (PRD Section 16.4) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Operational Change Log</h2>
          </div>
          <span className="text-xs text-slate-500">
            Displaying latest {auditLogs.length} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date & Time (IST)</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Mandatory Change Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {formatDateKolkata(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{log.changedByUser.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({log.changedByUser.role})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.entityType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action === "CREATE"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.action === "UPDATE"
                            ? "bg-blue-100 text-blue-800"
                            : log.action === "RENAME"
                            ? "bg-purple-100 text-purple-800"
                            : log.action === "COMPLETION"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {log.changeDescription}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
