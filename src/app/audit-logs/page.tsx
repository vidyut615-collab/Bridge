import { prisma } from "@/lib/prisma";
import { History } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0f1011] p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-[#f7f8f8]">System Audit Trail & Accountability</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 font-mono">
              Immutable Records
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#8a8f98]">
            Comprehensive chronological log of all changes across Question Bank, Master Data, Examinations, and Deployments.
          </p>
        </div>
      </div>

      {/* Audit Log Table (PRD Section 16.4) */}
      <div className="bg-white dark:bg-[#0f1011] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#5e6ad2] dark:text-[#8b95f6]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">Operational Change Log</h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-[#8a8f98] font-mono">
            Displaying latest {auditLogs.length} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#141516] uppercase font-semibold text-slate-600 dark:text-[#8a8f98] border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Date & Time (IST)</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Mandatory Change Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-[#62666d]">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition">
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-[#8a8f98] whitespace-nowrap">
                      {formatDateKolkata(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-[#d0d3d8] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{log.changedByUser.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-[#62666d] font-mono">
                          ({log.changedByUser.role})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-[#d0d3d8] border border-slate-200 dark:border-white/[0.08]">
                        {log.entityType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          log.action === "CREATE"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/20"
                            : log.action === "UPDATE"
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                            : log.action === "RENAME"
                            ? "bg-purple-50 dark:bg-purple-500/10 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20"
                            : log.action === "COMPLETION"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/20"
                            : "bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-[#d0d3d8] border border-slate-200 dark:border-white/[0.08]"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-[#f7f8f8]">
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
