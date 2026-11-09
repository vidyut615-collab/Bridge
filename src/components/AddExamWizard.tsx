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

  // Fetch live name preview whenever category, collegeId or title changes
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
      setError("Please select a college.");
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
        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3.5 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-2.5 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Category Selection */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">1. Examination Category</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Select the organizational scope to activate the correct sequence generator.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Global */}
          <div
            onClick={() => setCategory("GLOBAL")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              category === "GLOBAL"
                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50/70 dark:bg-zinc-800/50 ring-1 ring-zinc-900 dark:ring-zinc-100"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                <Globe className="h-4 w-4" />
              </div>
              <span className="font-semibold text-xs text-zinc-950 dark:text-zinc-50">Platform Examination</span>
            </div>
            <p className="text-xs text-zinc-500">
              Global assessment. Free title entry, no college naming sequence required.
            </p>
          </div>

          {/* College Training */}
          <div
            onClick={() => setCategory("COLLEGE_TRAINING")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              category === "COLLEGE_TRAINING"
                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50/70 dark:bg-zinc-800/50 ring-1 ring-zinc-900 dark:ring-zinc-100"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-semibold text-xs text-zinc-950 dark:text-zinc-50">College – Training (TR)</span>
            </div>
            <p className="text-xs text-zinc-500">
              Structured training assessments. Generates <code className="font-mono text-zinc-900 dark:text-zinc-100 text-[11px]">CODE-TR-TITLE-###</code>.
            </p>
          </div>

          {/* College Regular */}
          <div
            onClick={() => setCategory("COLLEGE_REGULAR")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              category === "COLLEGE_REGULAR"
                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50/70 dark:bg-zinc-800/50 ring-1 ring-zinc-900 dark:ring-zinc-100"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="font-semibold text-xs text-zinc-950 dark:text-zinc-50">College – Regular (RG)</span>
            </div>
            <p className="text-xs text-zinc-500">
              General college assessment. Sequence: <code className="font-mono text-zinc-900 dark:text-zinc-100 text-[11px]">CODE-RG-TITLE-###</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: College & Title Details with Live Naming Preview */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">2. College & Title Specifications</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Standardized examination title generation engine. Sequence code is allocated automatically upon creation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {category !== "GLOBAL" && (
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                Target College <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
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
            <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
              Examination Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quantitative Aptitude Mock Test or Placement Assessment"
              className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>
        </div>

        {/* Live Name Preview Blueprint Strip */}
        {namePreview && (
          <div className="p-3.5 rounded-lg bg-zinc-900 dark:bg-zinc-950 text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 block mb-0.5">
                Standardized Title Preview
              </span>
              <span className="text-xs sm:text-sm font-mono font-semibold text-zinc-100">
                {namePreview}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {codePreview !== "N/A" && (
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Sequence</span>
                  <span className="text-xs font-mono font-semibold bg-zinc-800 px-2 py-0.5 rounded">
                    #{codePreview}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleCopyPreview}
                title="Copy standardized name"
                className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Examination Metadata & Parameters */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">3. Metadata & Scoring Rules</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure delivery constraints, scoring parameters, and accessibility settings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
              Visibility
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as "PUBLIC" | "PRIVATE")}
              className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            >
              <option value="PRIVATE">Private (Restricted)</option>
              <option value="PUBLIC">Public</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
              className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
              Marks Correct (+)
            </label>
            <input
              type="number"
              step="0.25"
              required
              value={marksCorrect}
              onChange={(e) => setMarksCorrect(parseFloat(e.target.value) || 1)}
              className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
              Marks Incorrect (-)
            </label>
            <input
              type="number"
              step="0.25"
              required
              value={marksIncorrect}
              onChange={(e) => setMarksIncorrect(parseFloat(e.target.value) || 0)}
              className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
              Start Schedule (IST)
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
              End Schedule (IST)
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
              Attempt Policy
            </label>
            <select
              value={attemptPolicy}
              onChange={(e) => setAttemptPolicy(e.target.value as "UNLIMITED" | "LIMITED")}
              className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            >
              <option value="UNLIMITED">Unlimited Attempts</option>
              <option value="LIMITED">Limited Attempts</option>
            </select>
          </div>

          {attemptPolicy === "LIMITED" && (
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                Max Allowed Attempts
              </label>
              <input
                type="number"
                min="1"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
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
          className="h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-zinc-950 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
        >
          {isSubmitting ? "Allocating Sequence Code..." : "Register Examination & Build Composition"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
}
