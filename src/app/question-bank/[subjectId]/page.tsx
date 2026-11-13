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
      {/* Header */}
      <div className="pb-6 border-b border-[var(--border-hairline)]">
        <Link
          href="/question-bank"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 mb-3"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          <span>Back to question bank</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                {subject.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                {subject.topics.length} topics
              </span>
            </div>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              Manage atomic difficulty counts across topics. Subject totals aggregate automatically.
            </p>
          </div>

          <div className="flex items-center gap-4 craft-card px-5 py-3 text-right">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                Subject aggregate
              </span>
              <span className="text-xl font-semibold text-[var(--text-primary)] font-mono tabular-nums">
                {formatNumber(initialTotal)} questions
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
      <div className="craft-card overflow-hidden">
        <div className="p-5 border-b border-[var(--border-hairline)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              Subject inventory audit trail
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {allHistories.length} historical records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-raised)] text-xs font-mono text-[var(--text-muted)] border-b border-[var(--border-hairline)] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5 font-normal">Timestamp (IST)</th>
                <th className="py-3 px-5 font-normal">Topic</th>
                <th className="py-3 px-4 font-normal">User</th>
                <th className="py-3 px-4 text-center font-normal">Prior (I/II/III)</th>
                <th className="py-3 px-4 text-center font-normal">New (I/II/III)</th>
                <th className="py-3 px-5 font-normal">Change reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {allHistories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[var(--text-muted)] font-mono">
                    No historical modifications recorded for this subject
                  </td>
                </tr>
              ) : (
                allHistories.slice(0, 15).map((hist) => (
                  <tr key={hist.id} className="hover:bg-[var(--bg-raised)] transition-colors duration-150">
                    <td className="py-3.5 px-5 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {formatDateKolkata(hist.createdAt)}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-[var(--text-primary)]">
                      <span className="font-mono text-xs text-[var(--text-muted)] mr-2">{hist.topicCode}</span>
                      {hist.topicName}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)] text-xs">
                      {hist.changedByUser?.name || "System"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-[var(--text-muted)] tabular-nums">
                      {hist.prevEasy} / {hist.prevMedium} / {hist.prevHard}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs font-semibold text-[var(--text-primary)] tabular-nums">
                      {hist.newEasy} / {hist.newMedium} / {hist.newHard}
                    </td>
                    <td className="py-3.5 px-5 text-[var(--text-secondary)] text-xs">
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
