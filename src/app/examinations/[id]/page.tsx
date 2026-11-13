import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ExamDetailUnified from "@/components/ExamDetailUnified";

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

  // Fetch audit logs for change history attribution
  const auditLogs = await prisma.auditLog.findMany({
    where: { entityId: id },
    orderBy: { createdAt: "desc" },
    include: { changedByUser: true },
    take: 50,
  });

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
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/examinations"
          className="craft-button-secondary inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} /> Back to Examination Registry
        </Link>
      </div>

      {/* Unified Examination Interface */}
      <ExamDetailUnified
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
        auditLogs={auditLogs.map((a) => ({
          id: a.id,
          action: a.action,
          changeDescription: a.changeDescription,
          changedByName: a.changedByUser.name,
          createdAt: a.createdAt,
        }))}
      />
    </div>
  );
}
