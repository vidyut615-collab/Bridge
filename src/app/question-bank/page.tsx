import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers } from "lucide-react";
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
      {/* Header — Flat, Minimalist */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Question Bank Observability
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
              Active Inventory
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            3 difficulty levels (Roman I, II, III) defined per topic. Subject totals below are calculated automatically as the live aggregate of all topics.
          </p>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900/70 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="text-[11px] font-mono font-medium text-zinc-500 uppercase tracking-wider">Total Questions</div>
          <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 mt-1 tabular-nums tracking-tight">{formatNumber(grandTotal)}</div>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono">{subjects.length} Subjects Aggregate</div>
        </div>

        <div className="bg-white dark:bg-zinc-900/70 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="text-[11px] font-mono font-medium text-zinc-500 uppercase tracking-wider">Easy (Level I)</div>
          <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 mt-1 tabular-nums tracking-tight">{formatNumber(totalEasy)}</div>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono">
            {grandTotal > 0 ? `${((totalEasy / grandTotal) * 100).toFixed(1)}%` : "0%"} of total
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/70 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="text-[11px] font-mono font-medium text-zinc-500 uppercase tracking-wider">Medium (Level II)</div>
          <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 mt-1 tabular-nums tracking-tight">{formatNumber(totalMedium)}</div>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono">
            {grandTotal > 0 ? `${((totalMedium / grandTotal) * 100).toFixed(1)}%` : "0%"} of total
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/70 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="text-[11px] font-mono font-medium text-zinc-500 uppercase tracking-wider">Hard (Level III)</div>
          <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 mt-1 tabular-nums tracking-tight">{formatNumber(totalHard)}</div>
          <div className="text-[11px] text-zinc-500 mt-2 font-mono">
            {grandTotal > 0 ? `${((totalHard / grandTotal) * 100).toFixed(1)}%` : "0%"} of total
          </div>
        </div>
      </div>

      {/* Consolidated Inventory Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Subject Inventory Register</h2>
            <p className="text-[11px] text-zinc-500">Live synchronized aggregate of all underlying topic counts</p>
          </div>
          <span className="text-xs text-zinc-500 font-mono">{subjects.length} Registered Subjects</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-mono uppercase tracking-wider text-zinc-500 border-b border-zinc-200/80 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-4 w-12 text-center font-medium">No.</th>
                <th className="py-2.5 px-4 font-medium">Subject</th>
                <th className="py-2.5 px-4 text-center font-medium">Topics</th>
                <th className="py-2.5 px-4 text-right font-medium">Easy (I)</th>
                <th className="py-2.5 px-4 text-right font-medium">Medium (II)</th>
                <th className="py-2.5 px-4 text-right font-medium">Hard (III)</th>
                <th className="py-2.5 px-4 text-right font-semibold text-zinc-950 dark:text-zinc-50">Subject Total</th>
                <th className="py-2.5 px-4 font-medium">Latest Update</th>
                <th className="py-2.5 px-4 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 text-center text-zinc-400 font-mono">
                    {row.no}
                  </td>
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                    <Link
                      href={`/question-bank/${row.id}`}
                      className="hover:underline font-semibold"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
                      {row.topicsCount} Topics
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                    {formatNumber(row.easy)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                    {formatNumber(row.medium)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                    {formatNumber(row.hard)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
                    {formatNumber(row.total)}
                  </td>
                  <td className="py-3 px-4 text-zinc-500">
                    <div className="font-mono text-[11px] text-zinc-900 dark:text-zinc-100">
                      {row.lastUpdated ? formatDateKolkata(row.lastUpdated) : "—"}
                    </div>
                    <div className="text-[10px] text-zinc-400">{row.lastUpdatedBy}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/question-bank/${row.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                    >
                      Manage Topics <ArrowRight className="h-3 w-3" />
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
