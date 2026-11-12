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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-200/90 dark:border-zinc-800/90">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Question Bank Inventory
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {subjects.length} Subjects
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            3-tier difficulty governance (Roman I Easy, II Medium, III Hard) per topic. Subject totals represent live aggregates.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121214] p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs">
          <div className="text-[11px] font-mono text-zinc-500">TOTAL INVENTORY</div>
          <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 mt-1 tabular-nums tracking-tight">
            {formatNumber(grandTotal)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono">
            Across {subjects.length} active subjects
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs">
          <div className="text-[11px] font-mono text-zinc-500">I EASY</div>
          <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 mt-1 tabular-nums tracking-tight">
            {formatNumber(totalEasy)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono">
            {grandTotal > 0 ? `${((totalEasy / grandTotal) * 100).toFixed(1)}%` : "0%"} share
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs">
          <div className="text-[11px] font-mono text-zinc-500">II MEDIUM</div>
          <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 mt-1 tabular-nums tracking-tight">
            {formatNumber(totalMedium)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono">
            {grandTotal > 0 ? `${((totalMedium / grandTotal) * 100).toFixed(1)}%` : "0%"} share
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs">
          <div className="text-[11px] font-mono text-zinc-500">III HARD</div>
          <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 mt-1 tabular-nums tracking-tight">
            {formatNumber(totalHard)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono">
            {grandTotal > 0 ? `${((totalHard / grandTotal) * 100).toFixed(1)}%` : "0%"} share
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#121214] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">
            Subject Breakdown & Tier Weights
          </h2>
          <span className="text-[11px] text-zinc-500 font-mono">
            Displaying {rows.length} subjects
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-mono text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80">
              <tr>
                <th className="py-2.5 px-4 font-normal w-12 text-center">#</th>
                <th className="py-2.5 px-4 font-normal">Subject</th>
                <th className="py-2.5 px-4 font-normal text-center">Topics</th>
                <th className="py-2.5 px-4 text-right font-normal">I Easy</th>
                <th className="py-2.5 px-4 text-right font-normal">II Med</th>
                <th className="py-2.5 px-4 text-right font-normal">III Hard</th>
                <th className="py-2.5 px-4 text-right font-medium text-zinc-950 dark:text-zinc-100">Total</th>
                <th className="py-2.5 px-4 font-normal w-32">Tier Distribution</th>
                <th className="py-2.5 px-4 font-normal">Last Updated</th>
                <th className="py-2.5 px-4 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 text-center">
                    {row.no}
                  </td>
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                    <Link
                      href={`/question-bank/${row.id}`}
                      className="hover:underline underline-offset-2"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-zinc-600 dark:text-zinc-400">
                    {row.topicsCount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                    {formatNumber(row.easy)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                    {formatNumber(row.medium)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                    {formatNumber(row.hard)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium tabular-nums text-zinc-950 dark:text-zinc-50">
                    {formatNumber(row.total)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-24 bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden flex" title={`Easy: ${row.easyPct}%, Med: ${row.medPct}%, Hard: ${row.hardPct}%`}>
                      <div style={{ width: `${row.easyPct}%` }} className="bg-zinc-400 dark:bg-zinc-500 h-full" />
                      <div style={{ width: `${row.medPct}%` }} className="bg-zinc-700 dark:bg-zinc-300 h-full" />
                      <div style={{ width: `${row.hardPct}%` }} className="bg-zinc-950 dark:bg-zinc-100 h-full" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-zinc-500 font-mono whitespace-nowrap">
                    {row.lastUpdated ? formatDateKolkata(row.lastUpdated) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/question-bank/${row.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
                    >
                      Manage <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
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
