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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--border-hairline)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              Examination Registry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
              {rawExams.length} specifications
            </span>
          </div>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Atomic naming formulas, section blueprint allocators, and two-way deployment pipeline sync status across delivery nodes.
          </p>
        </div>

        <div>
          <Link
            href="/examinations/new"
            className="craft-button-primary inline-flex items-center gap-2 h-10 px-5 text-sm font-medium"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            <span>New Examination</span>
          </Link>
        </div>
      </div>

      {/* Interactive Examinations List & Filters */}
      <ExamListTable exams={formattedExams} />
    </div>
  );
}
