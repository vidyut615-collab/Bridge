"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { previewExamNameAction, createExamAction } from "@/app/actions/examActions";
import {
  Globe,
  GraduationCap,
  Briefcase,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

interface CollegeOption {
  id: string;
  name: string;
  code: string;
}

interface AddExamWizardProps {
  colleges: CollegeOption[];
}

export default function AddExamWizard({ colleges }: AddExamWizardProps) {
  const router = useRouter();

  // Wizard state
  const [category, setCategory] = useState<"GLOBAL" | "COLLEGE_TRAINING" | "COLLEGE_REGULAR">("COLLEGE_TRAINING");
  const [collegeId, setCollegeId] = useState(colleges[0]?.id || "");
  const [title, setTitle] = useState("");
  const [testType, setTestType] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");

  // Metadata
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [marksCorrect, setMarksCorrect] = useState(1);
  const [marksIncorrect, setMarksIncorrect] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attemptPolicy, setAttemptPolicy] = useState<"UNLIMITED" | "LIMITED">("UNLIMITED");
  const [maxAttempts, setMaxAttempts] = useState(1);

  // Live Name Preview state
  const [namePreview, setNamePreview] = useState("");
  const [codePreview, setCodePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function updatePreview() {
      if (!title.trim()) {
        setNamePreview("");
        setCodePreview("");
        return;
      }
      try {
        const res = await previewExamNameAction({
          category,
          collegeId: category !== "GLOBAL" ? collegeId : undefined,
          title,
        });
        setNamePreview(res.previewName);
        setCodePreview(res.codePreview);
      } catch {
        // ignore preview errors
      }
    }
    updatePreview();
  }, [category, collegeId, title]);

  const handleCopyPreview = () => {
    if (namePreview) {
      navigator.clipboard.writeText(namePreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Examination title is mandatory.");
      return;
    }

    if (category !== "GLOBAL" && !collegeId) {
      setError("Please select a target college.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createExamAction({
        category,
        collegeId: category !== "GLOBAL" ? collegeId : undefined,
        title,
        testType,
        durationMinutes,
        totalMarks,
        marksCorrect,
        marksIncorrect,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        attemptPolicy,
        maxAttempts: attemptPolicy === "LIMITED" ? maxAttempts : undefined,
      });

      if (res?.exam?.id) {
        router.push(`/examinations/${res.exam.id}`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3.5 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 flex items-center gap-2.5 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Category Selection */}
      <div className="bg-white dark:bg-[#121214] p-5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs space-y-3">
        <div>
          <h2 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">
            1. Scope & Categorization
          </h2>
          <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
            Determines atomic sequence code and naming convention
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Global */}
          <div
            onClick={() => setCategory("GLOBAL")}
            className={`cursor-pointer p-4 rounded-lg border transition-colors ${
              category === "GLOBAL"
                ? "border-zinc-950 dark:border-zinc-100 bg-zinc-50/90 dark:bg-zinc-800/60"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141417] hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Globe className="h-4 w-4 text-zinc-700 dark:text-zinc-300" strokeWidth={1.75} />
              <span className="font-medium text-xs text-zinc-950 dark:text-zinc-50">Global Assessment</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Platform-wide examination. Unconstrained title without college code prefix.
            </p>
          </div>

          {/* College Training */}
          <div
            onClick={() => setCategory("COLLEGE_TRAINING")}
            className={`cursor-pointer p-4 rounded-lg border transition-colors ${
              category === "COLLEGE_TRAINING"
                ? "border-zinc-950 dark:border-zinc-100 bg-zinc-50/90 dark:bg-zinc-800/60"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141417] hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <GraduationCap className="h-4 w-4 text-zinc-700 dark:text-zinc-300" strokeWidth={1.75} />
              <span className="font-medium text-xs text-zinc-950 dark:text-zinc-50">College Training (TR)</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              Formula: COLLEGE-TR-TITLE-###
            </p>
          </div>

          {/* College Regular */}
          <div
            onClick={() => setCategory("COLLEGE_REGULAR")}
            className={`cursor-pointer p-4 rounded-lg border transition-colors ${
              category === "COLLEGE_REGULAR"
                ? "border-zinc-950 dark:border-zinc-100 bg-zinc-50/90 dark:bg-zinc-800/60"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141417] hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Briefcase className="h-4 w-4 text-zinc-700 dark:text-zinc-300" strokeWidth={1.75} />
              <span className="font-medium text-xs text-zinc-950 dark:text-zinc-50">College Regular (RG)</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              Formula: COLLEGE-RG-TITLE-###
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: College & Title Details with Live Naming Preview */}
      <div className="bg-white dark:bg-[#121214] p-5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">
            2. College & Title Specifications
          </h2>
          <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
            Sequence code increments atomically per college and category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {category !== "GLOBAL" && (
            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">
                Target College <span className="text-zinc-400">*</span>
              </label>
              <select
                required
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
              >
                {colleges.map((col) => (
                  <option key={col.id} value={col.id} className="dark:bg-zinc-900">
                    {col.name} ({col.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={category === "GLOBAL" ? "md:col-span-2" : ""}>
            <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">
              Assessment Title <span className="text-zinc-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quantitative Aptitude Assessment"
              className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
            />
          </div>
        </div>

        {/* Live Name Preview Blueprint Strip */}
        {namePreview && (
          <div className="p-3.5 rounded-lg bg-zinc-900 dark:bg-[#18181b] text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <span className="text-[10px] font-mono text-zinc-400 block mb-0.5">
                ALLOCATED NAME PREVIEW
              </span>
              <span className="text-xs sm:text-sm font-mono font-medium text-zinc-100">
                {namePreview}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {codePreview !== "N/A" && (
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-400 block">Sequence</span>
                  <span className="text-xs font-mono font-semibold bg-zinc-800 px-2 py-0.5 rounded">
                    #{codePreview}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleCopyPreview}
                title="Copy standardized name"
                className="inline-flex items-center justify-center h-7 w-7 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-zinc-100" strokeWidth={1.75} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Examination Metadata & Parameters */}
      <div className="bg-white dark:bg-[#121214] p-5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">
            3. Delivery & Scoring Constraints
          </h2>
          <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
            Exam duration, marking values, schedule, and attempt limits
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">
              Visibility
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as "PUBLIC" | "PRIVATE")}
              className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
            >
              <option value="PRIVATE">Private (Restricted)</option>
              <option value="PUBLIC">Public</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
              className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">
              Marks Correct (+)
            </label>
            <input
              type="number"
              step="0.25"
              required
              value={marksCorrect}
              onChange={(e) => setMarksCorrect(parseFloat(e.target.value) || 1)}
              className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">
              Marks Incorrect (-)
            </label>
            <input
              type="number"
              step="0.25"
              required
              value={marksIncorrect}
              onChange={(e) => setMarksIncorrect(parseFloat(e.target.value) || 0)}
              className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <div>
            <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">
              Start Schedule (IST)
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">
              End Schedule (IST)
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">
              Attempt Policy
            </label>
            <select
              value={attemptPolicy}
              onChange={(e) => setAttemptPolicy(e.target.value as "UNLIMITED" | "LIMITED")}
              className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
            >
              <option value="UNLIMITED">Unlimited Attempts</option>
              <option value="LIMITED">Limited Attempts</option>
            </select>
          </div>

          {attemptPolicy === "LIMITED" && (
            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">
                Max Allowed Attempts
              </label>
              <input
                type="number"
                min="1"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit Action */}
      <div className="flex justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={() => router.push("/examinations")}
          className="h-8 px-4 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-zinc-950 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-2xs disabled:opacity-50"
        >
          {isSubmitting ? "Allocating..." : "Register Examination"}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </form>
  );
}
