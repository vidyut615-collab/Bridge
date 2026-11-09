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
      {/* Header — Flat, Minimalist */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              System Audit Trail & Accountability
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
              Immutable Records
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Comprehensive chronological log of all changes across Question Bank, Master Data, Examinations, and Deployments.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Operational Change Log</h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            Displaying latest {auditLogs.length} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 uppercase font-mono tracking-wider text-[11px] text-zinc-500 border-b border-zinc-200/80 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Date & Time (IST)</th>
                <th className="py-2.5 px-4 font-medium">User</th>
                <th className="py-2.5 px-4 font-medium">Entity Type</th>
                <th className="py-2.5 px-4 font-medium">Action</th>
                <th className="py-2.5 px-4 font-medium">Mandatory Change Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-zinc-500">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                      {formatDateKolkata(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{log.changedByUser.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          ({log.changedByUser.role})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700">
                        {log.entityType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
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
