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
      {/* Segmented Tab Navigation */}
      <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("composition")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === "composition"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-semibold shadow-2xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Composition & Blueprint
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("operations")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === "operations"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-semibold shadow-2xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          Deployment & Operations
          {(platformStatus?.testpressUpdatePending || platformStatus?.lmsUpdatePending) && (
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === "overview"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-semibold shadow-2xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Metadata & Settings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === "history"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-semibold shadow-2xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <History className="h-3.5 w-3.5" />
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
        <form onSubmit={handleUpdateMetadata} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-5 space-y-5 shadow-xs">
          <div>
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Examination Metadata & Configurations</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Title modifications will update the generated title while strictly preserving the unique code (<code className="font-mono text-zinc-900 dark:text-zinc-100">{exam.uniqueCode}</code>).
            </p>
          </div>

          {metadataFeedback && (
            <div
              className={`p-3.5 rounded-lg flex items-center gap-2.5 text-xs ${
                metadataFeedback.type === "success"
                  ? "bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
                  : "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30"
              }`}
            >
              {metadataFeedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <span>{metadataFeedback.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                Descriptive Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                Visibility Type
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as "PUBLIC" | "PRIVATE")}
                className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
              >
                <option value="PRIVATE">Private (College Specific)</option>
                <option value="PUBLIC">Public</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                Total Marks
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseFloat(e.target.value) || 100)}
                className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 font-mono focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                Marks for Correct (+)
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
                Marks for Incorrect (-)
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

          <div className="space-y-1.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider">
              Mandatory Change Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              placeholder="e.g. Updated exam title and duration per revised academic calendar."
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingMetadata}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {isUpdatingMetadata ? "Saving Metadata..." : "Save Metadata Modifications"}
            </button>
          </div>
        </form>
      )}

      {/* 4. History & Versions Tab */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Historical Examination Versions</h2>
            <span className="text-xs text-zinc-500">
              Active Version: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">v{exam.currentVersion}</strong>
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-mono uppercase tracking-wider text-zinc-500 border-b border-zinc-200/80 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Version</th>
                <th className="py-2.5 px-4 font-medium">Change Description</th>
                <th className="py-2.5 px-4 font-medium">Updated By</th>
                <th className="py-2.5 px-4 font-medium">Timestamp (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {/* Current version row */}
              <tr className="bg-zinc-50/40 dark:bg-zinc-800/20">
                <td className="py-3 px-4 font-mono font-semibold text-zinc-950 dark:text-zinc-50">
                  v{exam.currentVersion} (Current)
                </td>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Current active specification
                </td>
                <td className="py-3 px-4 text-zinc-500">Live</td>
                <td className="py-3 px-4 text-zinc-500 font-mono">Current</td>
              </tr>

              {/* Previous versions */}
              {versions.map((ver) => (
                <tr key={ver.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    v{ver.versionNumber}
                  </td>
                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                    {ver.changeDescription}
                  </td>
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
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
