import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ExamDetailTabs from "@/components/ExamDetailTabs";
import { formatDateKolkata } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExaminationDetailPage({ params }: PageProps) {
  const { id } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      college: true,
      platformStatus: {
        include: {
          testpressCompletedByUser: true,
          lmsCompletedByUser: true,
        },
      },
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          topics: true,
        },
      },
      versions: {
        orderBy: { versionNumber: "desc" },
        include: { changedByUser: true },
      },
      platformUpdateHistories: {
        orderBy: { createdAt: "desc" },
        include: { confirmedByUser: true },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  // Fetch all active subjects and topics for the Composition Builder
  const subjects = await prisma.subject.findMany({
    where: { isArchived: false },
    include: {
      topics: {
        where: { isArchived: false },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[var(--border-hairline)]">
        <Link
          href="/examinations"
          className="craft-button-secondary inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium mb-4"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} /> Back to Examination Registry
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] font-mono tracking-tight">
                {exam.generatedName}
              </h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border ${
                exam.overallStatus === "PUBLISHED" || exam.overallStatus === "COMPLETED"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : exam.overallStatus === "IN_REVIEW"
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                  : "bg-[var(--bg-raised)] text-[var(--text-secondary)] border-[var(--border-hairline)]"
              }`}>
                {exam.overallStatus.replace(/_/g, " ").toLowerCase()}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[var(--bg-raised)] text-[var(--text-primary)] border border-[var(--border-hairline)]">
                v{exam.currentVersion}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-sm text-[var(--text-secondary)]">
              <span className="font-mono text-[var(--text-primary)] font-semibold">{exam.examId}</span>
              <span>•</span>
              <span className="capitalize">{exam.category.replace(/_/g, " ").toLowerCase()}</span>
              {exam.college && (
                <>
                  <span>•</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {exam.college.name} ({exam.college.code})
                  </span>
                </>
              )}
              <span>•</span>
              <span className="font-mono font-medium">{exam.durationMinutes} min</span>
              <span>•</span>
              <span className="font-mono text-xs text-[var(--text-muted)]">Registered {formatDateKolkata(exam.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Interface */}
      <ExamDetailTabs
        exam={{
          id: exam.id,
          examId: exam.examId,
          category: exam.category as "GLOBAL" | "COLLEGE_TRAINING" | "COLLEGE_REGULAR",
          college: exam.college,
          title: exam.title,
          generatedName: exam.generatedName,
          uniqueCode: exam.uniqueCode,
          testType: exam.testType as "PUBLIC" | "PRIVATE",
          durationMinutes: exam.durationMinutes,
          totalMarks: exam.totalMarks,
          marksCorrect: exam.marksCorrect,
          marksIncorrect: exam.marksIncorrect,
          startDate: exam.startDate,
          endDate: exam.endDate,
          attemptPolicy: exam.attemptPolicy as "UNLIMITED" | "LIMITED",
          maxAttempts: exam.maxAttempts,
          overallStatus: exam.overallStatus,
          currentVersion: exam.currentVersion,
          createdAt: exam.createdAt,
        }}
        subjects={subjects}
        sections={exam.sections.map((s) => ({
          id: s.id,
          sectionName: s.sectionName,
          subjectId: s.subjectId,
          topics: s.topics.map((t) => ({
            topicId: t.topicId,
            questionCount: t.questionCount,
            level1Easy: t.level1Easy,
            level2Medium: t.level2Medium,
            level3Hard: t.level3Hard,
          })),
        }))}
        platformStatus={
          exam.platformStatus
            ? {
                testpressStatus: exam.platformStatus.testpressStatus,
                testpressCompletedAt: exam.platformStatus.testpressCompletedAt,
                testpressCompletedByName: exam.platformStatus.testpressCompletedByUser?.name,
                testpressNotes: exam.platformStatus.testpressNotes,
                lmsStatus: exam.platformStatus.lmsStatus,
                lmsCompletedAt: exam.platformStatus.lmsCompletedAt,
                lmsCompletedByName: exam.platformStatus.lmsCompletedByUser?.name,
                lmsNotes: exam.platformStatus.lmsNotes,
                testpressUpdatePending: exam.platformStatus.testpressUpdatePending,
                lmsUpdatePending: exam.platformStatus.lmsUpdatePending,
              }
            : null
        }
        platformUpdateHistories={exam.platformUpdateHistories.map((h) => ({
          id: h.id,
          platform: h.platform,
          action: h.action,
          changeDescription: h.changeDescription,
          confirmedByName: h.confirmedByUser.name,
          createdAt: h.createdAt,
        }))}
        versions={exam.versions.map((v) => ({
          id: v.id,
          versionNumber: v.versionNumber,
          changeDescription: v.changeDescription,
          changedByName: v.changedByUser.name,
          createdAt: v.createdAt,
        }))}
      />
    </div>
  );
}
