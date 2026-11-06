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
    <div className="space-y-8">
      {/* Back button & Subject Title Header */}
      <div>
        <Link
          href="/question-bank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-[#8a8f98] hover:text-[#5e6ad2] dark:hover:text-[#8b95f6] transition mb-3"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Question Bank Register
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0f1011] p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-[#f7f8f8]">{subject.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#8b95f6] border border-indigo-100 dark:border-[#5e6ad2]/30 font-mono">
                {subject.topics.length} Topics
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#8a8f98]">
              Manage 3 difficulty tier counts (Roman I, II, III) and folder paths per topic. Subject total aggregates all child topics.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#141516] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-right">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-[#8a8f98] uppercase tracking-wider block">
                Current Aggregate Total
              </span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-[#f7f8f8] font-mono">
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

      {/* Historical Topic Inventory Update Records */}
      <div className="bg-white dark:bg-[#0f1011] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#5e6ad2] dark:text-[#8b95f6]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">
              Topic Modification History
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-[#8a8f98] font-mono">
            {allHistories.length} historical updates recorded
          </span>
        </div>

        {allHistories.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-[#8a8f98]">
            No previous manual updates recorded yet for topics in this subject.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-[#141516] text-xs uppercase font-semibold text-slate-600 dark:text-[#8a8f98] border-b border-slate-200 dark:border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Updated By</th>
                  <th className="py-3 px-4 text-center">Easy (I)</th>
                  <th className="py-3 px-4 text-center">Medium (II)</th>
                  <th className="py-3 px-4 text-center">Hard (III)</th>
                  <th className="py-3 px-4">Mandatory Change Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {allHistories.map((hist) => (
                  <tr key={hist.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition">
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-[#8a8f98] whitespace-nowrap">
                      {formatDateKolkata(hist.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-[#5e6ad2] dark:text-[#8b95f6] mr-2">
                        {hist.topicCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-[#d0d3d8]">
                        {hist.topicName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800 dark:text-[#d0d3d8] whitespace-nowrap">
                      {hist.changedByUser.name}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-mono">
                      <div className="flex items-center justify-center gap-1.5 font-medium">
                        <span className="text-slate-400 dark:text-[#62666d]">{hist.prevEasy}</span>
                        <span className="text-slate-300 dark:text-[#62666d]">→</span>
                        <span className="text-emerald-700 dark:text-[#27a644] font-bold">{hist.newEasy}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-mono">
                      <div className="flex items-center justify-center gap-1.5 font-medium">
                        <span className="text-slate-400 dark:text-[#62666d]">{hist.prevMedium}</span>
                        <span className="text-slate-300 dark:text-[#62666d]">→</span>
                        <span className="text-amber-700 dark:text-[#f0bf00] font-bold">{hist.newMedium}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-mono">
                      <div className="flex items-center justify-center gap-1.5 font-medium">
                        <span className="text-slate-400 dark:text-[#62666d]">{hist.prevHard}</span>
                        <span className="text-slate-300 dark:text-[#62666d]">→</span>
                        <span className="text-rose-700 dark:text-[#eb5757] font-bold">{hist.newHard}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-[#d0d3d8] font-medium">
                      {hist.changeDescription}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
