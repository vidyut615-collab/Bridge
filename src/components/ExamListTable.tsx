"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";

export interface ExamListItem {
  id: string;
  examId: string;
  generatedName: string;
  testType: string;
  currentVersion: number;
  category: string;
  college?: { code: string; name: string } | null;
  durationMinutes: number;
  totalQuestions: number;
  sectionsCount: number;
  testpressStatus?: string;
  testpressUpdatePending?: boolean;
  lmsStatus?: string;
  lmsUpdatePending?: boolean;
  overallStatus: string;
}

interface ExamListTableProps {
  exams: ExamListItem[];
}

export default function ExamListTable({ exams }: ExamListTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.generatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.examId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exam.college?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (exam.college?.code.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesCategory =
      categoryFilter === "ALL" || exam.category === categoryFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "COMPLETED" && exam.overallStatus === "COMPLETED") ||
      (statusFilter === "TESTPRESS_PENDING" &&
        (exam.testpressStatus !== "COMPLETED" || exam.overallStatus === "READY_FOR_TESTPRESS")) ||
      (statusFilter === "LMS_PENDING" &&
        (exam.lmsStatus !== "COMPLETED" || exam.overallStatus === "LMS_PENDING"));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" strokeWidth={1.75} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search examinations..."
            className="h-8 w-full pl-8 pr-3 text-xs rounded-md bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-950 dark:focus:border-zinc-200 focus:bg-white dark:focus:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Segments */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category filter */}
          <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
            {[
              { id: "ALL", label: "All Types" },
              { id: "COLLEGE_TRAINING", label: "TR" },
              { id: "COLLEGE_REGULAR", label: "RG" },
              { id: "GLOBAL", label: "Global" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  categoryFilter === cat.id
                    ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-medium shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
            {[
              { id: "ALL", label: "All Status" },
              { id: "COMPLETED", label: "Completed" },
              { id: "TESTPRESS_PENDING", label: "TP Pending" },
              { id: "LMS_PENDING", label: "LMS Pending" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  statusFilter === st.id
                    ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-medium shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Examinations Table Container */}
      <div className="bg-white dark:bg-[#121214] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-mono">
            Showing <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{filteredExams.length}</strong> of {exams.length} examinations
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            Audit-synchronized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-mono text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80">
              <tr>
                <th className="py-2.5 px-4 font-normal">Exam Name & Code</th>
                <th className="py-2.5 px-4 font-normal">Category</th>
                <th className="py-2.5 px-4 font-normal">College</th>
                <th className="py-2.5 px-4 text-center font-normal">Sections / Qs</th>
                <th className="py-2.5 px-4 text-center font-normal">Duration</th>
                <th className="py-2.5 px-4 text-center font-normal">Testpress</th>
                <th className="py-2.5 px-4 text-center font-normal">Truskill LMS</th>
                <th className="py-2.5 px-4 text-center font-normal">Status</th>
                <th className="py-2.5 px-4 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-zinc-500 font-mono">
                    No examinations match filter query
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/examinations/${exam.id}`}
                        className="font-mono font-medium text-zinc-950 dark:text-zinc-100 hover:underline block text-xs"
                      >
                        {exam.generatedName}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px] text-zinc-400">
                        <span>{exam.examId}</span>
                        <span>•</span>
                        <span className="capitalize">{exam.testType.toLowerCase()}</span>
                        <span>•</span>
                        <span className="text-zinc-700 dark:text-zinc-300">v{exam.currentVersion}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
                        {exam.category === "COLLEGE_TRAINING"
                          ? "TR"
                          : exam.category === "COLLEGE_REGULAR"
                          ? "RG"
                          : "Global"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-zinc-500">
                      {exam.college ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">
                            {exam.college.code}
                          </span>
                          <span className="truncate max-w-[120px] text-[11px] text-zinc-400">
                            {exam.college.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 font-mono">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      <span className="font-medium text-zinc-950 dark:text-zinc-50 tabular-nums">{exam.totalQuestions} Qs</span>
                      <div className="text-[10px] text-zinc-400">
                        {exam.sectionsCount} {exam.sectionsCount === 1 ? "sec" : "secs"}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-zinc-600 dark:text-zinc-400 tabular-nums">
                      {exam.durationMinutes}m
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                        exam.testpressStatus === "COMPLETED"
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                          : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800"
                      }`}>
                        {exam.testpressStatus === "COMPLETED" ? "Synced" : "Pending"}
                      </span>
                      {exam.testpressUpdatePending && (
                        <div className="text-[9px] text-red-500 font-mono mt-0.5">
                          Update Req
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                        exam.lmsStatus === "COMPLETED"
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                          : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800"
                      }`}>
                        {exam.lmsStatus === "COMPLETED" ? "Synced" : "Pending"}
                      </span>
                      {exam.lmsUpdatePending && (
                        <div className="text-[9px] text-red-500 font-mono mt-0.5">
                          Update Req
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950">
                        {exam.overallStatus.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/examinations/${exam.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Open <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
                      </Link>
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
