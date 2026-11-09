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
    <div className="space-y-6">
      {/* Header — Flat, Minimalist */}
      <div className="pb-5 border-b border-zinc-200/80 dark:border-zinc-800">
        <Link
          href="/examinations"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-3"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Examination Registry
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold text-zinc-950 dark:text-zinc-50 font-mono tracking-tight">
                {exam.generatedName}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950">
                {exam.overallStatus.replace(/_/g, " ")}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
                v{exam.currentVersion}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-mono text-zinc-900 dark:text-zinc-100 font-semibold">{exam.examId}</span>
              <span>•</span>
              <span className="capitalize">{exam.category.replace(/_/g, " ").toLowerCase()}</span>
              {exam.college && (
                <>
                  <span>•</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {exam.college.name} ({exam.college.code})
                  </span>
                </>
              )}
              <span>•</span>
              <span className="font-mono">{exam.durationMinutes} min</span>
              <span>•</span>
              <span className="font-mono">Registered {formatDateKolkata(exam.createdAt)}</span>
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
