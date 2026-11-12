import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, History } from "lucide-react";
import TopicInventoryManager from "@/components/TopicInventoryManager";
import { formatDateKolkata, formatNumber } from "@/lib/utils";

interface PageProps {
  params: Promise<{ subjectId: string }>;
}

export default async function SubjectDetailPage({ params }: PageProps) {
  const { subjectId } = await params;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      topics: {
        where: { isArchived: false },
        orderBy: { topicCode: "asc" },
        include: {
          inventoryHistories: {
            orderBy: { createdAt: "desc" },
            include: { changedByUser: true },
          },
        },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  // Calculate live aggregate totals from topics
  const initialEasy = subject.topics.reduce((acc, t) => acc + t.easyCount, 0);
  const initialMedium = subject.topics.reduce((acc, t) => acc + t.mediumCount, 0);
  const initialHard = subject.topics.reduce((acc, t) => acc + t.hardCount, 0);
  const initialTotal = initialEasy + initialMedium + initialHard;

  // Flatten and sort all historical topic updates for this subject
  const allHistories = subject.topics
    .flatMap((t) =>
      t.inventoryHistories.map((h) => ({
        ...h,
        topicName: t.name,
        topicCode: t.topicCode,
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-zinc-200/90 dark:border-zinc-800/90">
        <Link
          href="/question-bank"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors mb-3"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} /> Back to Question Bank
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                {subject.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                {subject.topics.length} Topics
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Manage difficulty counts across topics. Subject totals aggregate automatically.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-[#121214] px-4 py-2 rounded-lg border border-zinc-200/90 dark:border-zinc-800/90 text-right shadow-2xs">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 block">
                CURRENT AGGREGATE
              </span>
              <span className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 font-mono tabular-nums">
                {formatNumber(initialTotal)} Qs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Topics Inventory Form */}
      <TopicInventoryManager
        subjectId={subject.id}
        subjectName={subject.name}
        initialTopics={subject.topics.map((t) => ({
          id: t.id,
          topicCode: t.topicCode,
          name: t.name,
          easyCount: t.easyCount,
          mediumCount: t.mediumCount,
          hardCount: t.hardCount,
          folderName: t.folderName,
        }))}
      />

      {/* Historical Audit Log for this Subject */}
      <div className="bg-white dark:bg-[#121214] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.75} />
            <h2 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Subject Inventory Audit Trail
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {allHistories.length} historical records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-mono text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80">
              <tr>
                <th className="py-2.5 px-4 font-normal">Timestamp (IST)</th>
                <th className="py-2.5 px-4 font-normal">Topic</th>
                <th className="py-2.5 px-4 font-normal">User</th>
                <th className="py-2.5 px-4 text-center font-normal">Prior (I/II/III)</th>
                <th className="py-2.5 px-4 text-center font-normal">New (I/II/III)</th>
                <th className="py-2.5 px-4 font-normal">Change Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {allHistories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-zinc-500 font-mono">
                    No historical modifications recorded for this subject
                  </td>
                </tr>
              ) : (
                allHistories.slice(0, 15).map((hist) => (
                  <tr key={hist.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                      {formatDateKolkata(hist.createdAt)}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                      <span className="font-mono text-zinc-400 mr-1.5">{hist.topicCode}</span>
                      {hist.topicName}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-700 dark:text-zinc-300">
                      {hist.changedByUser?.name || "System"}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-zinc-400 tabular-nums">
                      {hist.prevEasy} / {hist.prevMedium} / {hist.prevHard}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {hist.newEasy} / {hist.newMedium} / {hist.newHard}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-600 dark:text-zinc-400">
                      {hist.changeDescription}
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
