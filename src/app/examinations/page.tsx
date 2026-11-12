import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import ExamListTable, { ExamListItem } from "@/components/ExamListTable";

export default async function ExaminationsPage() {
  const rawExams = await prisma.exam.findMany({
    include: {
      college: true,
      platformStatus: true,
      sections: {
        include: {
          topics: true,
        },
      },
      createdByUser: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedExams: ExamListItem[] = rawExams.map((exam) => {
    const totalQuestions = exam.sections.reduce(
      (s, sec) => s + sec.topics.reduce((ts, top) => ts + top.questionCount, 0),
      0
    );

    return {
      id: exam.id,
      examId: exam.examId,
      generatedName: exam.generatedName,
      testType: exam.testType,
      currentVersion: exam.currentVersion,
      category: exam.category,
      college: exam.college ? { code: exam.college.code, name: exam.college.name } : null,
      durationMinutes: exam.durationMinutes,
      totalQuestions,
      sectionsCount: exam.sections.length,
      testpressStatus: exam.platformStatus?.testpressStatus,
      testpressUpdatePending: exam.platformStatus?.testpressUpdatePending,
      lmsStatus: exam.platformStatus?.lmsStatus,
      lmsUpdatePending: exam.platformStatus?.lmsUpdatePending,
      overallStatus: exam.overallStatus,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-200/90 dark:border-zinc-800/90">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Examination Registry
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {rawExams.length} Registered
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Assessment names, atomic sequence formulas, test blueprints, and deployment pipeline states.
          </p>
        </div>

        <div>
          <Link
            href="/examinations/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-950 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            New Examination
          </Link>
        </div>
      </div>

      {/* Interactive Examinations List & Filters */}
      <ExamListTable exams={formattedExams} />
    </div>
  );
}
