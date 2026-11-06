import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  FileSpreadsheet,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Building2,
  Layers,
} from "lucide-react";
import { formatDateKolkata, formatNumber } from "@/lib/utils";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Examination Registry</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {exams.length} Registered
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Internal registry of all assessments, generated naming sequences, metadata, and deployment statuses.
          </p>
        </div>

        <div>
          <Link
            href="/examinations/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-xs"
          >
            <PlusCircle className="h-4 w-4" />
            Add Examination
          </Link>
        </div>
      </div>

      {/* Examinations Table (PRD Section 15.4) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-600 border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-slate-500">
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
                    <tr key={exam.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/examinations/${exam.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition block text-sm"
                        >
                          {exam.generatedName}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-slate-400">
                          <span>{exam.examId}</span>
                          <span>•</span>
                          <span className="capitalize">{exam.testType.toLowerCase()}</span>
                          <span>•</span>
                          <span>v{exam.currentVersion}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-semibold">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] ${
                            exam.category === "GLOBAL"
                              ? "bg-slate-100 text-slate-700"
                              : exam.category === "COLLEGE_TRAINING"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {exam.category === "COLLEGE_TRAINING"
                            ? "Training (TR)"
                            : exam.category === "COLLEGE_REGULAR"
                            ? "Regular (RG)"
                            : "Global"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                        {exam.college ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-indigo-700 font-bold">
                              {exam.college.code}
                            </span>
                            <span className="truncate max-w-[120px] text-slate-500 font-normal">
                              {exam.college.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center text-xs">
                        <span className="font-bold text-slate-800">{totalQuestions} Qs</span>
                        <div className="text-[10px] text-slate-400">
                          {exam.sections.length} {exam.sections.length === 1 ? "Section" : "Sections"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-700">
                        {exam.durationMinutes} min
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                            exam.platformStatus?.testpressStatus === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {exam.platformStatus?.testpressStatus === "COMPLETED" ? "Completed" : "Pending"}
                        </span>
                        {exam.platformStatus?.testpressUpdatePending && (
                          <div className="text-[10px] text-orange-600 font-bold mt-0.5">
                            Update Pending
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                            exam.platformStatus?.lmsStatus === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {exam.platformStatus?.lmsStatus === "COMPLETED" ? "Completed" : "Pending"}
                        </span>
                        {exam.platformStatus?.lmsUpdatePending && (
                          <div className="text-[10px] text-orange-600 font-bold mt-0.5">
                            Update Pending
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                            exam.overallStatus === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : exam.overallStatus === "LMS_PENDING"
                              ? "bg-blue-100 text-blue-800"
                              : exam.overallStatus === "READY_FOR_TESTPRESS"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {exam.overallStatus.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/examinations/${exam.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
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
