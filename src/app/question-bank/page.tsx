import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { formatDateKolkata, formatNumber } from "@/lib/utils";

export default async function QuestionBankPage() {
  const subjects = await prisma.subject.findMany({
    where: { isArchived: false },
    include: {
      topics: {
        where: { isArchived: false },
        include: {
          inventoryHistories: {
            take: 1,
            orderBy: { createdAt: "desc" },
            include: { changedByUser: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Calculate totals across all subjects
  let grandTotal = 0;
  let totalEasy = 0;
  let totalMedium = 0;
  let totalHard = 0;

  const rows = subjects.map((sub, idx) => {
    const easy = sub.topics.reduce((acc, t) => acc + t.easyCount, 0);
    const medium = sub.topics.reduce((acc, t) => acc + t.mediumCount, 0);
    const hard = sub.topics.reduce((acc, t) => acc + t.hardCount, 0);
    const total = easy + medium + hard;

    grandTotal += total;
    totalEasy += easy;
    totalMedium += medium;
    totalHard += hard;

    const allTopicHistories = sub.topics.flatMap((t) => t.inventoryHistories);
    allTopicHistories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latestHistory = allTopicHistories[0];

    const easyPct = total > 0 ? ((easy / total) * 100).toFixed(0) : "0";
    const medPct = total > 0 ? ((medium / total) * 100).toFixed(0) : "0";
    const hardPct = total > 0 ? ((hard / total) * 100).toFixed(0) : "0";

    return {
      no: idx + 1,
      id: sub.id,
      name: sub.name,
      topicsCount: sub.topics.length,
      easy,
      medium,
      hard,
      total,
      easyPct,
      medPct,
      hardPct,
      lastUpdated: latestHistory?.createdAt,
      lastUpdatedBy: latestHistory?.changedByUser?.name || "Initial Seed",
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--border-hairline)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              Question bank inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
              {subjects.length} active subjects
            </span>
          </div>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Three-tier difficulty calibration (Level I Easy, Level II Medium, Level III Hard) per topic with real-time subject rollups.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="craft-card p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Total inventory</div>
          <div className="text-3xl font-semibold font-mono text-[var(--text-primary)] mt-3 tabular-nums">
            {formatNumber(grandTotal)}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1.5 font-sans">items</span>
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-3 font-mono">
            {subjects.length} subjects · {grandTotal > 0 ? "100%" : "0%"} pool
          </div>
        </div>

        <div className="craft-card p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Tier I Easy</div>
          <div className="text-3xl font-semibold font-mono text-emerald-600 dark:text-emerald-400 mt-3 tabular-nums">
            {formatNumber(totalEasy)}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1.5 font-sans font-mono">
              ({grandTotal > 0 ? ((totalEasy / grandTotal) * 100).toFixed(1) : "0"}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mt-3">
            <div style={{ width: `${grandTotal > 0 ? (totalEasy / grandTotal) * 100 : 0}%` }} className="h-full bg-emerald-500" />
          </div>
        </div>

        <div className="craft-card p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">Tier II Medium</div>
          <div className="text-3xl font-semibold font-mono text-amber-600 dark:text-amber-400 mt-3 tabular-nums">
            {formatNumber(totalMedium)}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1.5 font-sans font-mono">
              ({grandTotal > 0 ? ((totalMedium / grandTotal) * 100).toFixed(1) : "0"}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mt-3">
            <div style={{ width: `${grandTotal > 0 ? (totalMedium / grandTotal) * 100 : 0}%` }} className="h-full bg-amber-500" />
          </div>
        </div>

        <div className="craft-card p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Tier III Hard</div>
          <div className="text-3xl font-semibold font-mono text-indigo-600 dark:text-indigo-400 mt-3 tabular-nums">
            {formatNumber(totalHard)}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1.5 font-sans font-mono">
              ({grandTotal > 0 ? ((totalHard / grandTotal) * 100).toFixed(1) : "0"}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mt-3">
            <div style={{ width: `${grandTotal > 0 ? (totalHard / grandTotal) * 100 : 0}%` }} className="h-full bg-indigo-500" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="craft-card overflow-hidden">
        <div className="p-5 border-b border-[var(--border-hairline)] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              Subject breakdown and tier distribution
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Cumulative topic inventory across active subjects
            </p>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {rows.length} subjects
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-raised)] text-xs font-mono text-[var(--text-muted)] border-b border-[var(--border-hairline)] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5 font-normal w-12 text-center">#</th>
                <th className="py-3 px-5 font-normal">Subject</th>
                <th className="py-3 px-4 font-normal text-center">Topics</th>
                <th className="py-3 px-4 text-right font-normal">I Easy</th>
                <th className="py-3 px-4 text-right font-normal">II Med</th>
                <th className="py-3 px-4 text-right font-normal">III Hard</th>
                <th className="py-3 px-4 text-right font-semibold text-[var(--text-primary)]">Total</th>
                <th className="py-3 px-5 font-normal w-32">Tier balance</th>
                <th className="py-3 px-5 font-normal">Last updated</th>
                <th className="py-3 px-5 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--bg-raised)] transition-colors duration-150">
                  <td className="py-3.5 px-5 font-mono text-xs text-[var(--text-muted)] text-center">
                    {row.no}
                  </td>
                  <td className="py-3.5 px-5 font-medium text-[var(--text-primary)]">
                    <Link
                      href={`/question-bank/${row.id}`}
                      className="hover:underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-xs text-[var(--text-secondary)]">
                    {row.topicsCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatNumber(row.easy)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-amber-600 dark:text-amber-400">
                    {formatNumber(row.medium)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                    {formatNumber(row.hard)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums text-[var(--text-primary)]">
                    {formatNumber(row.total)}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="w-28 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden flex" title={`Easy: ${row.easyPct}%, Med: ${row.medPct}%, Hard: ${row.hardPct}%`}>
                      <div style={{ width: `${row.easyPct}%` }} className="bg-emerald-500 h-full" />
                      <div style={{ width: `${row.medPct}%` }} className="bg-amber-500 h-full" />
                      <div style={{ width: `${row.hardPct}%` }} className="bg-indigo-500 h-full" />
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-[var(--text-muted)] font-mono whitespace-nowrap">
                    {row.lastUpdated ? formatDateKolkata(row.lastUpdated) : "—"}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={`/question-bank/${row.id}`}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium bg-[var(--bg-raised)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border-hairline)] transition-colors duration-150"
                    >
                      <span>Manage</span>
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
