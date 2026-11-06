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
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 p-4 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-[#eb5757] flex items-center gap-2.5 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-[#eb5757]" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Category Selection */}
      <div className="bg-white dark:bg-[#0f1011] p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">1. Select Examination Category</h2>
          <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-0.5">
            Choose whether this is a platform-wide test or a college-specific assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Global */}
          <div
            onClick={() => setCategory("GLOBAL")}
            className={`cursor-pointer p-4 rounded-xl border-2 transition ${
              category === "GLOBAL"
                ? "border-[#5e6ad2] bg-indigo-50/40 dark:bg-[#5e6ad2]/15 shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.2)]"
                : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16] bg-white dark:bg-[#141516]"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-[#d0d3d8]">
                <Globe className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-[#f7f8f8]">Platform Examination</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8a8f98]">
              Global assessment. Free title entry, no college naming sequence required.
            </p>
          </div>

          {/* College Training */}
          <div
            onClick={() => setCategory("COLLEGE_TRAINING")}
            className={`cursor-pointer p-4 rounded-xl border-2 transition ${
              category === "COLLEGE_TRAINING"
                ? "border-[#5e6ad2] bg-indigo-50/40 dark:bg-[#5e6ad2]/15 shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.2)]"
                : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16] bg-white dark:bg-[#141516]"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-[#f7f8f8]">College – Training (TR)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8a8f98]">
              For structured Truskill training programs. Generates <code className="text-[#5e6ad2] dark:text-[#8b95f6] font-mono">CODE-TR-TITLE-###</code>.
            </p>
          </div>

          {/* College Regular */}
          <div
            onClick={() => setCategory("COLLEGE_REGULAR")}
            className={`cursor-pointer p-4 rounded-xl border-2 transition ${
              category === "COLLEGE_REGULAR"
                ? "border-[#5e6ad2] bg-indigo-50/40 dark:bg-[#5e6ad2]/15 shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.2)]"
                : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16] bg-white dark:bg-[#141516]"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-[#f7f8f8]">College – Regular (RG)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8a8f98]">
              General college assessment. Independent sequence: <code className="text-[#5e6ad2] dark:text-[#8b95f6] font-mono">CODE-RG-TITLE-###</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: College & Title with Live Naming Preview */}
      <div className="bg-white dark:bg-[#0f1011] p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">2. College & Title Details</h2>
          <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-0.5">
            Standardized examination title generation engine. Unique code allocated automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {category !== "GLOBAL" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] uppercase tracking-wider mb-1.5">
                Target College <span className="text-[#eb5757]">*</span>
              </label>
              <select
                required
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] focus:ring-2 focus:ring-[#5e6ad2] font-medium"
              >
                {colleges.map((col) => (
                  <option key={col.id} value={col.id} className="dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]">
                    {col.name} ({col.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={category === "GLOBAL" ? "md:col-span-2" : ""}>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] uppercase tracking-wider mb-1.5">
              Examination Title <span className="text-[#eb5757]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Aptitude Assessment or Placement Mock Test"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] placeholder-slate-400 dark:placeholder-[#62666d] focus:ring-2 focus:ring-[#5e6ad2]"
            />
          </div>
        </div>

        {/* Standardized Generated Name Preview Banner (PRD Section 8.3 & 9.3) */}
        {namePreview && (
          <div className="p-4 rounded-xl bg-slate-900 dark:bg-[#08090a] border border-slate-800 dark:border-white/[0.12] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-inner">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b95f6] block mb-0.5">
                Generated Examination Name Preview
              </span>
              <span className="text-base font-mono font-bold text-[#27a644]">
                {namePreview}
              </span>
            </div>
            {codePreview !== "N/A" && (
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 dark:text-[#8a8f98] block">Next Allocated Code</span>
                <span className="text-sm font-mono font-bold text-white bg-slate-800 dark:bg-[#191a1b] border border-white/[0.08] px-2.5 py-1 rounded-md">
                  #{codePreview}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 3: Assessment Metadata (PRD Section 10) */}
      <div className="bg-white dark:bg-[#0f1011] p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">3. Examination Metadata & Schedule</h2>
          <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-0.5">
            Configure duration, scoring rules, accessibility, and schedule in Asia/Kolkata timezone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
              Test Type (Visibility)
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as "PUBLIC" | "PRIVATE")}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
            >
              <option value="PRIVATE" className="dark:bg-[#141516]">Private (Restricted)</option>
              <option value="PUBLIC" className="dark:bg-[#141516]">Public</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
              Marks for Correct (+)
            </label>
            <input
              type="number"
              step="0.25"
              required
              value={marksCorrect}
              onChange={(e) => setMarksCorrect(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
              Marks for Incorrect (-)
            </label>
            <input
              type="number"
              step="0.25"
              required
              value={marksIncorrect}
              onChange={(e) => setMarksIncorrect(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
              Start Date & Time (IST)
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
              End Date & Time (IST)
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
              Attempt Policy
            </label>
            <select
              value={attemptPolicy}
              onChange={(e) => setAttemptPolicy(e.target.value as "UNLIMITED" | "LIMITED")}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
            >
              <option value="UNLIMITED" className="dark:bg-[#141516]">Unlimited Attempts</option>
              <option value="LIMITED" className="dark:bg-[#141516]">Limited Attempts</option>
            </select>
          </div>

          {attemptPolicy === "LIMITED" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
                Max Allowed Attempts
              </label>
              <input
                type="number"
                min="1"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit Action */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/[0.08]">
        <button
          type="button"
          onClick={() => router.push("/examinations")}
          className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/[0.12] text-sm font-semibold text-slate-600 dark:text-[#d0d3d8] hover:bg-slate-50 dark:hover:bg-white/[0.05] transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5e6ad2] hover:bg-[#6875e5] text-sm font-semibold text-white shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.35)] transition disabled:opacity-50"
        >
          {isSubmitting ? "Allocating Code & Creating..." : "Register Examination & Build Composition"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
