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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
              Question bank inventory
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-normal bg-[#f4f4f5] dark:bg-[#232325] text-zinc-600 dark:text-zinc-400 border border-black/[0.08] dark:border-white/[0.08]">
              {subjects.length} subjects
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            3-tier difficulty governance (Roman I Easy, II Medium, III Hard) per topic with live subject rollups
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#19191b] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08]">
          <div className="text-xs text-zinc-500 font-normal">Total inventory</div>
          <div className="text-[28px] leading-none font-medium font-mono text-zinc-900 dark:text-zinc-100 mt-2 tabular-nums">
            {formatNumber(grandTotal)}
          </div>
          <div className="text-xs text-zinc-500 mt-2 font-mono">
            {subjects.length} active subjects
          </div>
        </div>

        <div className="bg-white dark:bg-[#19191b] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08]">
          <div className="text-xs text-zinc-500 font-normal">Tier I Easy</div>
          <div className="text-[28px] leading-none font-medium font-mono text-zinc-900 dark:text-zinc-100 mt-2 tabular-nums">
            {formatNumber(totalEasy)}
          </div>
          <div className="text-xs text-zinc-500 mt-2 font-mono">
            {grandTotal > 0 ? `${((totalEasy / grandTotal) * 100).toFixed(1)}%` : "0%"} share
          </div>
        </div>

        <div className="bg-white dark:bg-[#19191b] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08]">
          <div className="text-xs text-zinc-500 font-normal">Tier II Medium</div>
          <div className="text-[28px] leading-none font-medium font-mono text-zinc-900 dark:text-zinc-100 mt-2 tabular-nums">
            {formatNumber(totalMedium)}
          </div>
          <div className="text-xs text-zinc-500 mt-2 font-mono">
            {grandTotal > 0 ? `${((totalMedium / grandTotal) * 100).toFixed(1)}%` : "0%"} share
          </div>
        </div>

        <div className="bg-white dark:bg-[#19191b] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08]">
          <div className="text-xs text-zinc-500 font-normal">Tier III Hard</div>
          <div className="text-[28px] leading-none font-medium font-mono text-zinc-900 dark:text-zinc-100 mt-2 tabular-nums">
            {formatNumber(totalHard)}
          </div>
          <div className="text-xs text-zinc-500 mt-2 font-mono">
            {grandTotal > 0 ? `${((totalHard / grandTotal) * 100).toFixed(1)}%` : "0%"} share
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#19191b] rounded-xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden">
        <div className="p-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <h2 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
            Subject breakdown and tier weights
          </h2>
          <span className="text-[11px] text-zinc-500 font-mono">
            {rows.length} subjects
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f4f5] dark:bg-[#232325] text-[11px] font-mono text-zinc-500 border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-2.5 px-4 font-normal w-12 text-center">#</th>
                <th className="py-2.5 px-4 font-normal">Subject</th>
                <th className="py-2.5 px-4 font-normal text-center">Topics</th>
                <th className="py-2.5 px-4 text-right font-normal">I Easy</th>
                <th className="py-2.5 px-4 text-right font-normal">II Med</th>
                <th className="py-2.5 px-4 text-right font-normal">III Hard</th>
                <th className="py-2.5 px-4 text-right font-medium text-zinc-900 dark:text-zinc-100">Total</th>
                <th className="py-2.5 px-4 font-normal w-28">Distribution</th>
                <th className="py-2.5 px-4 font-normal">Last updated</th>
                <th className="py-2.5 px-4 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-150">
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 text-center">
                    {row.no}
                  </td>
                  <td className="py-3 px-4 font-normal text-zinc-900 dark:text-zinc-100">
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
                  <td className="py-3 px-4 text-right font-mono font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                    {formatNumber(row.total)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-24 bg-black/[0.06] dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden flex" title={`Easy: ${row.easyPct}%, Med: ${row.medPct}%, Hard: ${row.hardPct}%`}>
                      <div style={{ width: `${row.easyPct}%` }} className="bg-zinc-300 dark:bg-zinc-600 h-full" />
                      <div style={{ width: `${row.medPct}%` }} className="bg-zinc-500 dark:bg-zinc-400 h-full" />
                      <div style={{ width: `${row.hardPct}%` }} className="bg-zinc-900 dark:bg-zinc-100 h-full" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-zinc-500 font-mono whitespace-nowrap">
                    {row.lastUpdated ? formatDateKolkata(row.lastUpdated) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/question-bank/${row.id}`}
                      className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-xs font-medium bg-[#f4f4f5] dark:bg-[#232325] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-zinc-800 dark:text-zinc-200 border border-black/[0.08] dark:border-white/[0.08] transition-colors duration-150"
                    >
                      Manage <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
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
