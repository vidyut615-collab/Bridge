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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or college..."
            className="h-9 w-full pl-9 pr-3 text-xs rounded-lg bg-[var(--bg-card)] border border-[var(--border-hairline)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Segments */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category filter */}
          <div className="flex items-center gap-1 bg-[var(--bg-raised)] p-1 rounded-lg border border-[var(--border-hairline)] text-xs">
            {[
              { id: "ALL", label: "All types" },
              { id: "COLLEGE_TRAINING", label: "TR" },
              { id: "COLLEGE_REGULAR", label: "RG" },
              { id: "GLOBAL", label: "Global" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors duration-150 ${
                  categoryFilter === cat.id
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-hairline)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-[var(--bg-raised)] p-1 rounded-lg border border-[var(--border-hairline)] text-xs">
            {[
              { id: "ALL", label: "All status" },
              { id: "COMPLETED", label: "Deployed" },
              { id: "TESTPRESS_PENDING", label: "TP pending" },
              { id: "LMS_PENDING", label: "LMS pending" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors duration-150 ${
                  statusFilter === st.id
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-hairline)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Examinations Table Container */}
      <div className="craft-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border-hairline)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Showing <strong className="text-[var(--text-primary)] font-semibold">{filteredExams.length}</strong> of {exams.length} examinations
          </span>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            Audit synchronized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-raised)] text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
              <tr>
                <th className="py-3 px-4">Exam Name & Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">College</th>
                <th className="py-3 px-4 text-center">Sections / Qs</th>
                <th className="py-3 px-4 text-center">Duration</th>
                <th className="py-3 px-4 text-center">Testpress</th>
                <th className="py-3 px-4 text-center">Truskill LMS</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-sm text-[var(--text-muted)] font-mono">
                    No examinations match filter query
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-[var(--bg-raised)]/60 transition-colors duration-150">
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/examinations/${exam.id}`}
                        className="font-medium text-sm text-[var(--text-primary)] hover:underline block leading-snug"
                      >
                        {exam.generatedName}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 font-mono text-xs text-[var(--text-muted)]">
                        <span className="text-[var(--text-secondary)] font-medium">{exam.examId}</span>
                        <span>•</span>
                        <span className="capitalize">{exam.testType.toLowerCase()}</span>
                        <span>•</span>
                        <span className="text-[var(--text-primary)] font-medium">v{exam.currentVersion}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                        {exam.category === "COLLEGE_TRAINING"
                          ? "College Training"
                          : exam.category === "COLLEGE_REGULAR"
                          ? "College Regular"
                          : "Global"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[var(--text-muted)]">
                      {exam.college ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-[var(--text-primary)] font-semibold">
                            {exam.college.code}
                          </span>
                          <span className="truncate max-w-[140px] text-xs text-[var(--text-muted)]">
                            {exam.college.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)] font-mono">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="font-semibold text-sm text-[var(--text-primary)] tabular-nums">{exam.totalQuestions} Qs</span>
                      <div className="text-xs text-[var(--text-muted)]">
                        {exam.sectionsCount} {exam.sectionsCount === 1 ? "section" : "sections"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-sm text-[var(--text-secondary)] tabular-nums">
                      {exam.durationMinutes}m
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border ${
                        exam.testpressStatus === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-[var(--bg-raised)] text-[var(--text-muted)] border-[var(--border-hairline)]"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${exam.testpressStatus === "COMPLETED" ? "bg-emerald-500" : "bg-zinc-400"}`} />
                        {exam.testpressStatus === "COMPLETED" ? "Synced" : "Pending"}
                      </span>
                      {exam.testpressUpdatePending && (
                        <div className="text-[11px] text-amber-500 font-mono font-medium mt-1">
                          Update req
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border ${
                        exam.lmsStatus === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-[var(--bg-raised)] text-[var(--text-muted)] border-[var(--border-hairline)]"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${exam.lmsStatus === "COMPLETED" ? "bg-emerald-500" : "bg-zinc-400"}`} />
                        {exam.lmsStatus === "COMPLETED" ? "Synced" : "Pending"}
                      </span>
                      {exam.lmsUpdatePending && (
                        <div className="text-[11px] text-amber-500 font-mono font-medium mt-1">
                          Update req
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border ${
                        exam.overallStatus === "PUBLISHED" || exam.overallStatus === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : exam.overallStatus === "IN_REVIEW"
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                          : "bg-[var(--bg-raised)] text-[var(--text-secondary)] border-[var(--border-hairline)]"
                      }`}>
                        {exam.overallStatus.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/examinations/${exam.id}`}
                        className="craft-button-secondary inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium"
                      >
                        Open <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
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
