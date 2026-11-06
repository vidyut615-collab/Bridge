"use client";

import { useState } from "react";
import { updateExamMetadataAction } from "@/app/actions/examActions";
import CompositionBuilder from "./CompositionBuilder";
import DeploymentTrackingView from "./DeploymentTrackingView";
import {
  FileSpreadsheet,
  Layers,
  Send,
  History,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatDateKolkata } from "@/lib/utils";

interface ExamData {
  id: string;
  examId: string;
  category: "GLOBAL" | "COLLEGE_TRAINING" | "COLLEGE_REGULAR";
  college?: { id: string; name: string; code: string } | null;
  title: string;
  generatedName: string;
  uniqueCode: string;
  testType: "PUBLIC" | "PRIVATE";
  durationMinutes: number;
  totalMarks: number;
  marksCorrect: number;
  marksIncorrect: number;
  startDate: Date | string | null;
  endDate: Date | string | null;
  attemptPolicy: "UNLIMITED" | "LIMITED";
  maxAttempts: number | null;
  overallStatus: string;
  currentVersion: number;
  createdAt: Date | string;
}

interface ExamDetailTabsProps {
  exam: ExamData;
  subjects: {
    id: string;
    name: string;
    topics: { id: string; name: string }[];
  }[];
  sections: {
    id: string;
    sectionName: string;
    subjectId: string;
    topics: {
      topicId: string;
      questionCount: number;
      level1Easy: number;
      level2Medium: number;
      level3Hard: number;
    }[];
  }[];
  platformStatus: {
    testpressStatus: string;
    testpressCompletedAt: Date | string | null;
    testpressCompletedByName?: string | null;
    testpressNotes?: string | null;
    lmsStatus: string;
    lmsCompletedAt: Date | string | null;
    lmsCompletedByName?: string | null;
    lmsNotes?: string | null;
    testpressUpdatePending: boolean;
    lmsUpdatePending: boolean;
  } | null;
  platformUpdateHistories: {
    id: string;
    platform: string;
    action: string;
    changeDescription: string;
    confirmedByName: string;
    createdAt: Date | string;
  }[];
  versions: {
    id: string;
    versionNumber: number;
    changeDescription: string;
    changedByName: string;
    createdAt: Date | string;
  }[];
}

export default function ExamDetailTabs({
  exam,
  subjects,
  sections,
  platformStatus,
  platformUpdateHistories,
  versions,
}: ExamDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "composition" | "operations" | "history">("composition");

  // Metadata form state
  const [title, setTitle] = useState(exam.title);
  const [testType, setTestType] = useState<"PUBLIC" | "PRIVATE">(exam.testType);
  const [durationMinutes, setDurationMinutes] = useState(exam.durationMinutes);
  const [totalMarks, setTotalMarks] = useState(exam.totalMarks);
  const [marksCorrect, setMarksCorrect] = useState(exam.marksCorrect);
  const [marksIncorrect, setMarksIncorrect] = useState(exam.marksIncorrect);
  const [attemptPolicy, setAttemptPolicy] = useState<"UNLIMITED" | "LIMITED">(exam.attemptPolicy);
  const [maxAttempts, setMaxAttempts] = useState(exam.maxAttempts || 1);
  const [changeDescription, setChangeDescription] = useState("");
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);
  const [metadataFeedback, setMetadataFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isCompletedExam = exam.overallStatus === "COMPLETED";

  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeDescription.trim()) {
      setMetadataFeedback({
        type: "error",
        text: "A change description is mandatory when updating examination metadata.",
      });
      return;
    }

    setIsUpdatingMetadata(true);
    setMetadataFeedback(null);

    try {
      await updateExamMetadataAction({
        examId: exam.id,
        title,
        testType,
        durationMinutes,
        totalMarks,
        marksCorrect,
        marksIncorrect,
        attemptPolicy,
        maxAttempts: attemptPolicy === "LIMITED" ? maxAttempts : undefined,
        changeDescription,
      });

      setMetadataFeedback({
        type: "success",
        text: isCompletedExam
          ? "Metadata updated! A new version was created and external platform update flags were triggered."
          : "Metadata saved successfully!",
      });
      setChangeDescription("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMetadataFeedback({ type: "error", text: errorMsg });
    } finally {
      setIsUpdatingMetadata(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-white/[0.08] gap-2">
        <button
          onClick={() => setActiveTab("composition")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === "composition"
              ? "border-[#5e6ad2] text-[#5e6ad2] dark:text-[#8b95f6]"
              : "border-transparent text-slate-500 dark:text-[#8a8f98] hover:text-slate-800 dark:hover:text-[#f7f8f8]"
          }`}
        >
          <Layers className="h-4 w-4" />
          Composition & AI Blueprint
        </button>

        <button
          onClick={() => setActiveTab("operations")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === "operations"
              ? "border-[#5e6ad2] text-[#5e6ad2] dark:text-[#8b95f6]"
              : "border-transparent text-slate-500 dark:text-[#8a8f98] hover:text-slate-800 dark:hover:text-[#f7f8f8]"
          }`}
        >
          <Send className="h-4 w-4" />
          Deployment & Operations
          {(platformStatus?.testpressUpdatePending || platformStatus?.lmsUpdatePending) && (
            <span className="h-2 w-2 rounded-full bg-[#f0bf00] animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === "overview"
              ? "border-[#5e6ad2] text-[#5e6ad2] dark:text-[#8b95f6]"
              : "border-transparent text-slate-500 dark:text-[#8a8f98] hover:text-slate-800 dark:hover:text-[#f7f8f8]"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Metadata & Settings
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === "history"
              ? "border-[#5e6ad2] text-[#5e6ad2] dark:text-[#8b95f6]"
              : "border-transparent text-slate-500 dark:text-[#8a8f98] hover:text-slate-800 dark:hover:text-[#f7f8f8]"
          }`}
        >
          <History className="h-4 w-4" />
          Versions ({versions.length + 1})
        </button>
      </div>

      {/* 1. Composition Tab */}
      {activeTab === "composition" && (
        <CompositionBuilder
          examId={exam.id}
          isCompletedExam={isCompletedExam}
          subjects={subjects}
          initialSections={sections}
        />
      )}

      {/* 2. Deployment Operations Tab */}
      {activeTab === "operations" && (
        <DeploymentTrackingView
          examId={exam.id}
          overallStatus={exam.overallStatus}
          platformStatus={platformStatus}
          updateHistories={platformUpdateHistories}
        />
      )}

      {/* 3. Overview & Metadata Tab */}
      {activeTab === "overview" && (
        <form onSubmit={handleUpdateMetadata} className="bg-white dark:bg-[#0f1011] rounded-2xl border border-slate-200 dark:border-white/[0.08] p-6 space-y-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">Examination Metadata & Configurations</h2>
            <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-0.5">
              Title modifications will update the generated title while strictly preserving the unique code (<code className="text-[#5e6ad2] dark:text-[#8b95f6] font-mono">{exam.uniqueCode}</code>).
            </p>
          </div>

          {metadataFeedback && (
            <div
              className={`p-4 rounded-xl flex items-center gap-2.5 text-sm ${
                metadataFeedback.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/30"
                  : "bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-[#eb5757] border border-rose-200 dark:border-rose-500/30"
              }`}
            >
              {metadataFeedback.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-[#27a644] shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-[#eb5757] shrink-0" />
              )}
              <span>{metadataFeedback.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
                Descriptive Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
                Visibility Type
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as "PUBLIC" | "PRIVATE")}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
              >
                <option value="PRIVATE" className="dark:bg-[#141516]">Private (College Specific)</option>
                <option value="PUBLIC" className="dark:bg-[#141516]">Public</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                Total Marks
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseFloat(e.target.value) || 100)}
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

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
            <label className="block text-xs font-bold text-slate-800 dark:text-[#d0d3d8] uppercase tracking-wider">
              Mandatory Change Reason <span className="text-[#eb5757]">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              placeholder="e.g. Updated exam title and duration per revised academic calendar."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] placeholder-slate-400 dark:placeholder-[#62666d]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingMetadata}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5e6ad2] hover:bg-[#6875e5] text-white font-semibold text-xs shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.35)] transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isUpdatingMetadata ? "Saving Metadata..." : "Save Metadata Modifications"}
            </button>
          </div>
        </form>
      )}

      {/* 4. History & Versions Tab (PRD Section 14.5) */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-[#0f1011] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">Historical Examination Versions</h2>
            <span className="text-xs text-slate-500 dark:text-[#8a8f98]">
              Current Active Version: <strong className="text-slate-800 dark:text-[#f7f8f8] font-mono">v{exam.currentVersion}</strong>
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#141516] uppercase font-semibold text-slate-600 dark:text-[#8a8f98] border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-2.5 px-4">Version</th>
                <th className="py-2.5 px-4">Change Description</th>
                <th className="py-2.5 px-4">Updated By</th>
                <th className="py-2.5 px-4">Timestamp (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {/* Current version row */}
              <tr className="bg-indigo-50/30 dark:bg-[#5e6ad2]/10">
                <td className="py-3 px-4 font-mono font-bold text-[#5e6ad2] dark:text-[#8b95f6]">
                  v{exam.currentVersion} (Current)
                </td>
                <td className="py-3 px-4 font-semibold text-slate-800 dark:text-[#f7f8f8]">
                  Current active specification
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-[#8a8f98] font-medium">Live</td>
                <td className="py-3 px-4 text-slate-500 dark:text-[#8a8f98] font-mono">Current</td>
              </tr>

              {/* Previous versions */}
              {versions.map((ver) => (
                <tr key={ver.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-[#d0d3d8]">
                    v{ver.versionNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-[#d0d3d8] font-medium">
                    {ver.changeDescription}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-[#d0d3d8] font-semibold">
                    {ver.changedByName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-[#8a8f98]">
                    {formatDateKolkata(ver.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
