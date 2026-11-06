import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, ArrowRight } from "lucide-react";

export default async function ExaminationsPage() {
  const exams = await prisma.exam.findMany({
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0f1011] p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-[#f7f8f8]">Examination Registry</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#8b95f6] border border-indigo-100 dark:border-[#5e6ad2]/30 font-mono">
              {exams.length} Registered
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#8a8f98]">
            Internal registry of all assessments, generated naming sequences, metadata, and deployment statuses.
          </p>
        </div>

        <div>
          <Link
            href="/examinations/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5e6ad2] hover:bg-[#6875e5] text-sm font-semibold text-white shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.35)] transition"
          >
            <PlusCircle className="h-4 w-4" />
            Add Examination
          </Link>
        </div>
      </div>

      {/* Examinations Table (PRD Section 15.4) */}
      <div className="bg-white dark:bg-[#0f1011] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-[#141516] text-xs uppercase font-semibold text-slate-600 dark:text-[#8a8f98] border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4">Exam Name & ID</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">College</th>
                <th className="py-3.5 px-4 text-center">Sections / Qs</th>
                <th className="py-3.5 px-4 text-center">Duration</th>
                <th className="py-3.5 px-4 text-center">Testpress</th>
                <th className="py-3.5 px-4 text-center">Truskill LMS</th>
                <th className="py-3.5 px-4 text-center">Overall Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-slate-500 dark:text-[#8a8f98]">
                    No examinations registered yet. Click &quot;Add Examination&quot; to register your first assessment.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => {
                  const totalQuestions = exam.sections.reduce(
                    (s, sec) => s + sec.topics.reduce((ts, top) => ts + top.questionCount, 0),
                    0
                  );

                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/examinations/${exam.id}`}
                          className="font-bold text-slate-900 dark:text-[#f7f8f8] hover:text-[#5e6ad2] dark:hover:text-[#8b95f6] transition block text-sm"
                        >
                          {exam.generatedName}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-slate-400 dark:text-[#62666d]">
                          <span>{exam.examId}</span>
                          <span>•</span>
                          <span className="capitalize">{exam.testType.toLowerCase()}</span>
                          <span>•</span>
                          <span className="text-[#5e6ad2] dark:text-[#8b95f6]">v{exam.currentVersion}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-semibold">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                            exam.category === "GLOBAL"
                              ? "bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-[#d0d3d8] border border-slate-200 dark:border-white/[0.08]"
                              : exam.category === "COLLEGE_TRAINING"
                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                              : "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20"
                          }`}
                        >
                          {exam.category === "COLLEGE_TRAINING"
                            ? "Training (TR)"
                            : exam.category === "COLLEGE_REGULAR"
                            ? "Regular (RG)"
                            : "Global"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700 dark:text-[#d0d3d8]">
                        {exam.college ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[#5e6ad2] dark:text-[#8b95f6] font-bold">
                              {exam.college.code}
                            </span>
                            <span className="truncate max-w-[120px] text-slate-500 dark:text-[#8a8f98] font-normal">
                              {exam.college.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-[#62666d]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center text-xs">
                        <span className="font-bold text-slate-800 dark:text-[#f7f8f8] font-mono">{totalQuestions} Qs</span>
                        <div className="text-[10px] text-slate-400 dark:text-[#62666d]">
                          {exam.sections.length} {exam.sections.length === 1 ? "Section" : "Sections"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] font-mono">
                        {exam.durationMinutes} min
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold font-mono ${
                            exam.platformStatus?.testpressStatus === "COMPLETED"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/20"
                              : "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-[#f0bf00] border border-amber-200 dark:border-amber-500/20"
                          }`}
                        >
                          {exam.platformStatus?.testpressStatus === "COMPLETED" ? "Completed" : "Pending"}
                        </span>
                        {exam.platformStatus?.testpressUpdatePending && (
                          <div className="text-[10px] text-[#eb5757] font-bold mt-0.5">
                            Update Pending
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold font-mono ${
                            exam.platformStatus?.lmsStatus === "COMPLETED"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/20"
                              : "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-[#f0bf00] border border-amber-200 dark:border-amber-500/20"
                          }`}
                        >
                          {exam.platformStatus?.lmsStatus === "COMPLETED" ? "Completed" : "Pending"}
                        </span>
                        {exam.platformStatus?.lmsUpdatePending && (
                          <div className="text-[10px] text-[#eb5757] font-bold mt-0.5">
                            Update Pending
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono ${
                            exam.overallStatus === "COMPLETED"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/20"
                              : exam.overallStatus === "LMS_PENDING"
                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                              : exam.overallStatus === "READY_FOR_TESTPRESS"
                              ? "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-[#f0bf00] border border-amber-200 dark:border-amber-500/20"
                              : "bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-[#d0d3d8] border border-slate-200 dark:border-white/[0.08]"
                          }`}
                        >
                          {exam.overallStatus.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/examinations/${exam.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/[0.05] text-slate-800 dark:text-[#d0d3d8] hover:bg-[#5e6ad2] hover:text-white dark:hover:bg-[#5e6ad2] dark:hover:text-white border border-slate-200 dark:border-white/[0.08] transition"
                        >
                          Manage <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
