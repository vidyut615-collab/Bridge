import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    // Subject totals are the exact aggregate of its topics
    const easy = sub.topics.reduce((acc, t) => acc + t.easyCount, 0);
    const medium = sub.topics.reduce((acc, t) => acc + t.mediumCount, 0);
    const hard = sub.topics.reduce((acc, t) => acc + t.hardCount, 0);
    const total = easy + medium + hard;

    grandTotal += total;
    totalEasy += easy;
    totalMedium += medium;
    totalHard += hard;

    // Latest topic update in this subject
    const allTopicHistories = sub.topics.flatMap((t) => t.inventoryHistories);
    allTopicHistories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latestHistory = allTopicHistories[0];

    return {
      no: idx + 1,
      id: sub.id,
      name: sub.name,
      topicsCount: sub.topics.length,
      easy,
      medium,
      hard,
      total,
      lastUpdated: latestHistory?.createdAt,
      lastUpdatedBy: latestHistory?.changedByUser?.name || "System Seed",
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0f1011] p-5 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#f7f8f8]">Question Bank Observability</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#27a644]/15 text-[#27a644] border border-[#27a644]/30">
              Active Inventory
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8a8f98]">
            3 difficulty levels (Roman I, II, III) defined per topic. Subject totals below are calculated automatically as the live aggregate of all topics.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0f1011] p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="text-[11px] font-mono font-semibold text-[#8a8f98] uppercase tracking-wider">Total Questions</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#f7f8f8] mt-1 tabular-nums">{formatNumber(grandTotal)}</div>
          <div className="text-[11px] text-[#8a8f98] mt-1 font-mono">{subjects.length} Subjects Aggregate</div>
        </div>

        <div className="bg-white dark:bg-[#0f1011] p-4 rounded-xl border border-emerald-200 dark:border-[#27a644]/30 bg-emerald-50/20 dark:bg-[#27a644]/5">
          <div className="text-[11px] font-mono font-semibold text-[#27a644] uppercase tracking-wider">Easy (Level I)</div>
          <div className="text-2xl font-bold font-mono text-[#27a644] mt-1 tabular-nums">{formatNumber(totalEasy)}</div>
          <div className="text-[11px] text-[#27a644]/80 mt-1 font-mono">
            {grandTotal > 0 ? `${((totalEasy / grandTotal) * 100).toFixed(1)}%` : "0%"} of total
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f1011] p-4 rounded-xl border border-amber-200 dark:border-[#f0bf00]/30 bg-amber-50/20 dark:bg-[#f0bf00]/5">
          <div className="text-[11px] font-mono font-semibold text-[#f0bf00] uppercase tracking-wider">Medium (Level II)</div>
          <div className="text-2xl font-bold font-mono text-[#f0bf00] mt-1 tabular-nums">{formatNumber(totalMedium)}</div>
          <div className="text-[11px] text-[#f0bf00]/80 mt-1 font-mono">
            {grandTotal > 0 ? `${((totalMedium / grandTotal) * 100).toFixed(1)}%` : "0%"} of total
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f1011] p-4 rounded-xl border border-red-200 dark:border-[#eb5757]/30 bg-red-50/20 dark:bg-[#eb5757]/5">
          <div className="text-[11px] font-mono font-semibold text-[#eb5757] uppercase tracking-wider">Hard (Level III)</div>
          <div className="text-2xl font-bold font-mono text-[#eb5757] mt-1 tabular-nums">{formatNumber(totalHard)}</div>
          <div className="text-[11px] text-[#eb5757]/80 mt-1 font-mono">
            {grandTotal > 0 ? `${((totalHard / grandTotal) * 100).toFixed(1)}%` : "0%"} of total
          </div>
        </div>
      </div>

      {/* Consolidated Inventory Table (PRD Section 5.6) */}
      <div className="bg-white dark:bg-[#0f1011] rounded-xl border border-slate-200 dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#f7f8f8]">Subject Inventory Register</h2>
          <span className="text-xs text-[#8a8f98]">Click &quot;Manage Topics&quot; to inspect & modify individual topic counts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#141516] text-[11px] font-mono uppercase tracking-wider text-[#8a8f98] border-b border-slate-200 dark:border-white/[0.06]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">No.</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3 text-center">Topics</th>
                <th className="py-2.5 px-3 text-right">Easy (I)</th>
                <th className="py-2.5 px-3 text-right">Medium (II)</th>
                <th className="py-2.5 px-3 text-right">Hard (III)</th>
                <th className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-[#f7f8f8]">Subject Total</th>
                <th className="py-2.5 px-3">Latest Update</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 text-center text-[#8a8f98] font-mono">
                    {row.no}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-[#f7f8f8]">
                    <Link
                      href={`/question-bank/${row.id}`}
                      className="hover:text-[#5e6ad2] transition font-bold"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 dark:bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#8b95f6] border border-indigo-100 dark:border-[#5e6ad2]/30">
                      {row.topicsCount} Topics
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#27a644]">
                    {formatNumber(row.easy)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#f0bf00]">
                    {formatNumber(row.medium)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#eb5757]">
                    {formatNumber(row.hard)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-[#f7f8f8]">
                    {formatNumber(row.total)}
                  </td>
                  <td className="py-2.5 px-3 text-[#8a8f98] font-mono text-[10px]">
                    <div>{formatDateKolkata(row.lastUpdated)}</div>
                    <div className="text-[9px] text-[#62666d]">by {row.lastUpdatedBy}</div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Link
                      href={`/question-bank/${row.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-[#d0d6e0] hover:text-[#5e6ad2] transition"
                    >
                      Manage Topics <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}

              {/* Total Row (PRD Section 5.6 Table Footer) */}
              <tr className="bg-slate-100 dark:bg-[#141516] font-bold text-slate-900 dark:text-[#f7f8f8] border-t-2 border-slate-300 dark:border-white/[0.1]">
                <td colSpan={3} className="py-3 px-3 uppercase text-[10px] font-mono tracking-wider text-[#8a8f98]">
                  Total Across All Subjects
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-[#27a644]">
                  {formatNumber(totalEasy)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-[#f0bf00]">
                  {formatNumber(totalMedium)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-[#eb5757]">
                  {formatNumber(totalHard)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-[#f7f8f8] text-sm">
                  {formatNumber(grandTotal)}
                </td>
                <td colSpan={2} className="py-3 px-3 text-[11px] text-[#8a8f98] italic font-mono">
                  {subjects.length} active subject aggregates
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
