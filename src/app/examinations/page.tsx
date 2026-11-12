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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
              Examination registry
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-normal bg-[#f4f4f5] dark:bg-[#232325] text-zinc-600 dark:text-zinc-400 border border-black/[0.08] dark:border-white/[0.08]">
              {rawExams.length} registered
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Assessment names, atomic sequence formulas, test blueprints, and deployment pipeline states
          </p>
        </div>

        <div>
          <Link
            href="/examinations/new"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-zinc-900 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-150 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)]"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            New examination
          </Link>
        </div>
      </div>

      {/* Interactive Examinations List & Filters */}
      <ExamListTable exams={formattedExams} />
    </div>
  );
}
