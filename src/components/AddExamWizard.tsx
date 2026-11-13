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
        <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" strokeWidth={1.5} />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Category Selection */}
      <div className="craft-card p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            1. Scope & Categorization
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Select the organizational scope to determine the deterministic sequence formula and naming standard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Global */}
          <div
            onClick={() => setCategory("GLOBAL")}
            className={`cursor-pointer p-4 rounded-xl border transition-all duration-150 ${
              category === "GLOBAL"
                ? "border-indigo-500 bg-[var(--bg-raised)] ring-1 ring-indigo-500/50 shadow-sm"
                : "border-[var(--border-hairline)] bg-[var(--bg-card)] hover:border-[var(--border-prominent)]"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`p-2 rounded-lg ${category === "GLOBAL" ? "bg-indigo-500/10 text-indigo-500" : "bg-[var(--bg-raised)] text-[var(--text-secondary)]"}`}>
                <Globe className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-sm text-[var(--text-primary)]">Global Assessment</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Platform-wide examination accessible across cohorts without college prefix
            </p>
          </div>

          {/* College Training */}
          <div
            onClick={() => setCategory("COLLEGE_TRAINING")}
            className={`cursor-pointer p-4 rounded-xl border transition-all duration-150 ${
              category === "COLLEGE_TRAINING"
                ? "border-indigo-500 bg-[var(--bg-raised)] ring-1 ring-indigo-500/50 shadow-sm"
                : "border-[var(--border-hairline)] bg-[var(--bg-card)] hover:border-[var(--border-prominent)]"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`p-2 rounded-lg ${category === "COLLEGE_TRAINING" ? "bg-indigo-500/10 text-indigo-500" : "bg-[var(--bg-raised)] text-[var(--text-secondary)]"}`}>
                <GraduationCap className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-sm text-[var(--text-primary)]">College Training (TR)</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-mono">
              Pattern: [COLLEGE]-TR-[TITLE]-###
            </p>
          </div>

          {/* College Regular */}
          <div
            onClick={() => setCategory("COLLEGE_REGULAR")}
            className={`cursor-pointer p-4 rounded-xl border transition-all duration-150 ${
              category === "COLLEGE_REGULAR"
                ? "border-indigo-500 bg-[var(--bg-raised)] ring-1 ring-indigo-500/50 shadow-sm"
                : "border-[var(--border-hairline)] bg-[var(--bg-card)] hover:border-[var(--border-prominent)]"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`p-2 rounded-lg ${category === "COLLEGE_REGULAR" ? "bg-indigo-500/10 text-indigo-500" : "bg-[var(--bg-raised)] text-[var(--text-secondary)]"}`}>
                <Briefcase className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-sm text-[var(--text-primary)]">College Regular (RG)</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-mono">
              Pattern: [COLLEGE]-RG-[TITLE]-###
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: College & Title Details with Live Naming Preview */}
      <div className="craft-card p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            2. Institutional Parameters & Title
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Sequence code increments atomically per college code and target category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {category !== "GLOBAL" && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Target College <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none transition-colors duration-150"
              >
                {colleges.map((col) => (
                  <option key={col.id} value={col.id} className="dark:bg-[#11141c]">
                    {col.name} ({col.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={category === "GLOBAL" ? "md:col-span-2" : ""}>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Assessment Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quantitative Aptitude Diagnostic Exam"
              className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors duration-150"
            />
          </div>
        </div>

        {/* Live Name Preview Blueprint Strip */}
        {namePreview && (
          <div className="p-4 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <span className="text-xs font-mono font-medium text-[var(--text-muted)] block mb-1">
                Standardized Deterministic Sequence Formula
              </span>
              <span className="text-base font-mono font-bold text-[var(--text-primary)] tracking-wide">
                {namePreview}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {codePreview !== "N/A" && (
                <div className="text-right">
                  <span className="text-xs font-mono text-[var(--text-muted)] block">Sequence</span>
                  <span className="text-xs font-mono font-bold bg-[var(--bg-card)] border border-[var(--border-hairline)] px-2.5 py-1 rounded text-indigo-500">
                    #{codePreview}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleCopyPreview}
                title="Copy standardized name"
                className="craft-button-secondary inline-flex items-center justify-center h-8 w-8 rounded-lg"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" strokeWidth={1.5} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Examination Metadata & Parameters */}
      <div className="craft-card p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            3. Delivery & Scoring Constraints
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configure delivery duration, negative marking policy, testing window, and candidate attempt limits
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Access Visibility
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as "PUBLIC" | "PRIVATE")}
              className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none transition-colors duration-150"
            >
              <option value="PRIVATE">Private (Restricted / Enrolled)</option>
              <option value="PUBLIC">Public (Open Link)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
              className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] font-mono tabular-nums focus:border-indigo-500 focus:outline-none transition-colors duration-150"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Correct Answer Mark (+)
            </label>
            <input
              type="number"
              step="0.25"
              required
              value={marksCorrect}
              onChange={(e) => setMarksCorrect(parseFloat(e.target.value) || 1)}
              className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] font-mono tabular-nums focus:border-indigo-500 focus:outline-none transition-colors duration-150"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Incorrect Penalty Mark (-)
            </label>
            <input
              type="number"
              step="0.25"
              required
              value={marksIncorrect}
              onChange={(e) => setMarksIncorrect(parseFloat(e.target.value) || 0)}
              className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] font-mono tabular-nums focus:border-indigo-500 focus:outline-none transition-colors duration-150"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 pt-4 border-t border-[var(--border-hairline)]">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Start Schedule (IST)
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] font-mono focus:border-indigo-500 focus:outline-none transition-colors duration-150"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              End Schedule (IST)
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] font-mono focus:border-indigo-500 focus:outline-none transition-colors duration-150"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Attempt Policy
            </label>
            <select
              value={attemptPolicy}
              onChange={(e) => setAttemptPolicy(e.target.value as "UNLIMITED" | "LIMITED")}
              className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none transition-colors duration-150"
            >
              <option value="UNLIMITED">Unlimited Attempts</option>
              <option value="LIMITED">Strict Limited Attempts</option>
            </select>
          </div>

          {attemptPolicy === "LIMITED" && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Max Allowed Attempts
              </label>
              <input
                type="number"
                min="1"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] font-mono tabular-nums focus:border-indigo-500 focus:outline-none transition-colors duration-150"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit Action */}
      <div className="flex justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={() => router.push("/examinations")}
          className="craft-button-secondary h-10 px-5 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="craft-button-primary h-10 px-6 text-sm font-medium inline-flex items-center gap-2"
        >
          {isSubmitting ? "Allocating Sequence..." : "Register Examination"}
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </form>
  );
}
