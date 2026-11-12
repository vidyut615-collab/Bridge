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
  const [activeTab, setActiveTab] = useState<"composition" | "operations" | "overview" | "history">("composition");

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
        text: "A mandatory change description is required for audit logs.",
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
          ? "Metadata updated. New version created and platform update flags flagged."
          : "Metadata saved.",
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
      {/* Segmented Tab Navigation */}
      <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("composition")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "composition"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-medium shadow-2xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Layers className="h-3.5 w-3.5" strokeWidth={1.75} />
          Composition Matrix
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("operations")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "operations"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-medium shadow-2xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
          Deployment Pipeline
          {(platformStatus?.testpressUpdatePending || platformStatus?.lmsUpdatePending) && (
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "overview"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-medium shadow-2xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" strokeWidth={1.75} />
          Parameters & Settings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "history"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-medium shadow-2xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <History className="h-3.5 w-3.5" strokeWidth={1.75} />
          Version Audit ({versions.length + 1})
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
        <form onSubmit={handleUpdateMetadata} className="bg-white dark:bg-[#121214] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 p-5 space-y-5 shadow-2xs">
          <div>
            <h2 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Assessment Metadata
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
              Title modifications preserve sequence code ({exam.uniqueCode})
            </p>
          </div>

          {metadataFeedback && (
            <div
              className={`p-3.5 rounded-lg flex items-center gap-2.5 text-xs ${
                metadataFeedback.type === "success"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
                  : "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40"
              }`}
            >
              {metadataFeedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-zinc-100 shrink-0" strokeWidth={1.75} />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" strokeWidth={1.75} />
              )}
              <span>{metadataFeedback.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">
                Descriptive Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">
                Visibility Type
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                Total Marks
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseFloat(e.target.value) || 100)}
                className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-500 mb-1.5">
                Marks for Correct (+)
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
                Marks for Incorrect (-)
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

          <div className="space-y-1.5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <label className="block text-[11px] font-mono text-zinc-500">
              Mandatory Change Reason <span className="text-zinc-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              placeholder="Document reason for metadata modification."
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingMetadata}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-2xs disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
              {isUpdatingMetadata ? "Saving..." : "Save Metadata Modifications"}
            </button>
          </div>
        </form>
      )}

      {/* 4. History & Versions Tab */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-[#121214] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Historical Versions
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">
              Active: v{exam.currentVersion}
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-mono text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80">
              <tr>
                <th className="py-2.5 px-4 font-normal">Version</th>
                <th className="py-2.5 px-4 font-normal">Change Description</th>
                <th className="py-2.5 px-4 font-normal">User</th>
                <th className="py-2.5 px-4 font-normal">Timestamp (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              <tr className="bg-zinc-50/40 dark:bg-zinc-800/20 font-medium">
                <td className="py-3 px-4 font-mono text-zinc-950 dark:text-zinc-50">
                  v{exam.currentVersion} (Current)
                </td>
                <td className="py-3 px-4 text-zinc-900 dark:text-zinc-100">
                  Active specification in effect
                </td>
                <td className="py-3 px-4 text-zinc-500 font-mono">—</td>
                <td className="py-3 px-4 text-zinc-500 font-mono">Current</td>
              </tr>

              {versions.map((ver) => (
                <tr key={ver.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-zinc-900 dark:text-zinc-100">
                    v{ver.versionNumber}
                  </td>
                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                    {ver.changeDescription}
                  </td>
                  <td className="py-3 px-4 text-zinc-900 dark:text-zinc-100">
                    {ver.changedByName}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500">
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
