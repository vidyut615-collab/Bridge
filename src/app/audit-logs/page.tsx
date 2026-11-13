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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--border-hairline)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              Operational Audit Ledger
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Immutable Stream
            </span>
          </div>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Chronological audit stream recording user attribution, delta states, and mandatory justifications across examinations, subject inventories, and master datasets.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="craft-card overflow-hidden">
        <div className="px-6 py-4 bg-[var(--bg-raised)] border-b border-[var(--border-hairline)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">System Change Events</h2>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Displaying latest {auditLogs.length} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-raised)]/60 text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
              <tr>
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Mandatory Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-[var(--text-muted)] font-mono">
                    No audit records logged yet
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-raised)]/40 transition-colors duration-150">
                    <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {formatDateKolkata(log.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[var(--text-primary)] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{log.changedByUser.name}</span>
                        <span className="text-xs text-[var(--text-muted)] font-mono">
                          ({log.changedByUser.role})
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                        {log.entityType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-[var(--text-primary)] text-[var(--bg-card)]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-primary)]">
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
