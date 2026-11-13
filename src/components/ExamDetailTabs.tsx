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
      <div className="craft-card-subtle p-1.5 inline-flex flex-wrap items-center gap-1.5 border border-[var(--border-hairline)] rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab("composition")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 ${
            activeTab === "composition"
              ? "bg-[var(--bg-raised)] text-[var(--text-primary)] font-semibold shadow-sm border border-[var(--border-hairline)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]/40 font-medium"
          }`}
        >
          <Layers className="h-4 w-4" strokeWidth={1.5} />
          Composition Matrix
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("operations")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 ${
            activeTab === "operations"
              ? "bg-[var(--bg-raised)] text-[var(--text-primary)] font-semibold shadow-sm border border-[var(--border-hairline)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]/40 font-medium"
          }`}
        >
          <Send className="h-4 w-4" strokeWidth={1.5} />
          Deployment Pipeline
          {(platformStatus?.testpressUpdatePending || platformStatus?.lmsUpdatePending) && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 ${
            activeTab === "overview"
              ? "bg-[var(--bg-raised)] text-[var(--text-primary)] font-semibold shadow-sm border border-[var(--border-hairline)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]/40 font-medium"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" strokeWidth={1.5} />
          Parameters & Settings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 ${
            activeTab === "history"
              ? "bg-[var(--bg-raised)] text-[var(--text-primary)] font-semibold shadow-sm border border-[var(--border-hairline)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]/40 font-medium"
          }`}
        >
          <History className="h-4 w-4" strokeWidth={1.5} />
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
        <form onSubmit={handleUpdateMetadata} className="craft-card p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Assessment Delivery Metadata
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Title modifications preserve deterministic sequence code ({exam.uniqueCode})
            </p>
          </div>

          {metadataFeedback && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                metadataFeedback.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
            >
              {metadataFeedback.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" strokeWidth={1.5} />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" strokeWidth={1.5} />
              )}
              <span>{metadataFeedback.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Descriptive Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none transition-colors duration-150"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Visibility Type
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
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
                Total Marks
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseFloat(e.target.value) || 100)}
                className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] font-mono tabular-nums focus:border-indigo-500 focus:outline-none transition-colors duration-150"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Marks for Correct (+)
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
                Marks for Incorrect (-)
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

          <div className="space-y-2 pt-4 border-t border-[var(--border-hairline)]">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Mandatory Change Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              placeholder="Explicitly document rationale for parameter change (e.g. Extended duration by +15m per faculty review)"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors duration-150"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingMetadata}
              className="craft-button-primary h-10 px-6 text-sm font-medium inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" strokeWidth={1.5} />
              {isUpdatingMetadata ? "Saving Changes..." : "Save Metadata Modifications"}
            </button>
          </div>
        </form>
      )}

      {/* 4. History & Versions Tab */}
      {activeTab === "history" && (
        <div className="craft-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-hairline)] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Historical Version Audit Trail
            </h2>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Active Version: v{exam.currentVersion}
            </span>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-raised)] text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
              <tr>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Change Description</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Timestamp (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              <tr className="bg-[var(--bg-raised)]/60 font-medium">
                <td className="py-3.5 px-4 font-mono font-semibold text-[var(--text-primary)]">
                  v{exam.currentVersion} (Current)
                </td>
                <td className="py-3.5 px-4 text-[var(--text-primary)]">
                  Active specification in effect
                </td>
                <td className="py-3.5 px-4 text-[var(--text-muted)] font-mono">—</td>
                <td className="py-3.5 px-4 text-[var(--text-muted)] font-mono">Current</td>
              </tr>

              {versions.map((ver) => (
                <tr key={ver.id} className="hover:bg-[var(--bg-raised)]/40 transition-colors duration-150">
                  <td className="py-3.5 px-4 font-mono font-semibold text-[var(--text-primary)]">
                    v{ver.versionNumber}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                    {ver.changeDescription}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-primary)] font-medium">
                    {ver.changedByName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)]">
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
