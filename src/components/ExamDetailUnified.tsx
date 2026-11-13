"use client";

import { useState } from "react";
import {
  setExamTestpressStatusAction,
  toggleExamTruskillLmsAction,
  updateExamMetadataAction,
} from "@/app/actions/examActions";
import CompositionBuilder from "./CompositionBuilder";
import {
  Copy,
  Check,
  Globe,
  GraduationCap,
  Briefcase,
  Layers,
  Settings,
  History,
  CheckCircle2,
  Clock,
  Archive,
  ChevronDown,
  ChevronUp,
  Save,
  AlertCircle,
  ExternalLink,
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

interface MasterSubject {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
}

interface ExamDetailUnifiedProps {
  exam: ExamData;
  subjects: MasterSubject[];
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
  auditLogs?: {
    id: string;
    action: string;
    changeDescription: string;
    changedByName: string;
    createdAt: Date | string;
  }[];
}

export default function ExamDetailUnified({
  exam,
  subjects,
  sections,
  platformStatus,
  platformUpdateHistories,
  versions,
  auditLogs = [],
}: ExamDetailUnifiedProps) {
  // Clipboard copy state
  const [copied, setCopied] = useState(false);

  // Platform action loading states
  const [isUpdatingTestpress, setIsUpdatingTestpress] = useState(false);
  const [isUpdatingLms, setIsUpdatingLms] = useState(false);
  const [platformFeedback, setPlatformFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Parameters form state
  const [isParamsOpen, setIsParamsOpen] = useState(false);
  const [title, setTitle] = useState(exam.title);
  const [testType, setTestType] = useState<"PUBLIC" | "PRIVATE">(exam.testType);
  const [durationMinutes, setDurationMinutes] = useState(exam.durationMinutes);
  const [totalMarks, setTotalMarks] = useState(exam.totalMarks);
  const [marksCorrect, setMarksCorrect] = useState(exam.marksCorrect);
  const [marksIncorrect, setMarksIncorrect] = useState(exam.marksIncorrect);
  const [isUpdatingParams, setIsUpdatingParams] = useState(false);
  const [paramsFeedback, setParamsFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isTestpressPublished = platformStatus?.testpressStatus === "COMPLETED";
  const isTestpressArchived = platformStatus?.testpressStatus === "ARCHIVED";
  const isLmsListed = platformStatus?.lmsStatus === "COMPLETED";

  const handleCopyName = () => {
    navigator.clipboard.writeText(exam.generatedName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetTestpressStatus = async (status: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    setIsUpdatingTestpress(true);
    setPlatformFeedback(null);
    try {
      await setExamTestpressStatusAction({
        examId: exam.id,
        status,
      });
      setPlatformFeedback({
        type: "success",
        text:
          status === "PUBLISHED"
            ? "Marked as Published on Testpress. History updated."
            : status === "ARCHIVED"
            ? "Marked as Archived / Removed from Testpress. History updated."
            : "Reset to Draft status on Testpress.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPlatformFeedback({ type: "error", text: msg });
    } finally {
      setIsUpdatingTestpress(false);
    }
  };

  const handleToggleLms = async (targetListed: boolean) => {
    setIsUpdatingLms(true);
    setPlatformFeedback(null);
    try {
      await toggleExamTruskillLmsAction({
        examId: exam.id,
        isListed: targetListed,
      });
      setPlatformFeedback({
        type: "success",
        text: targetListed
          ? "Examination successfully marked as Listed on Truskill LMS. History updated."
          : "Examination unlisted from Truskill LMS.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPlatformFeedback({ type: "error", text: msg });
    } finally {
      setIsUpdatingLms(false);
    }
  };

  const handleSaveParameters = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingParams(true);
    setParamsFeedback(null);
    try {
      await updateExamMetadataAction({
        examId: exam.id,
        title,
        testType,
        durationMinutes,
        totalMarks,
        marksCorrect,
        marksIncorrect,
        attemptPolicy: exam.attemptPolicy,
        maxAttempts: exam.maxAttempts || undefined,
      });
      setParamsFeedback({
        type: "success",
        text: "Parameters successfully saved. History updated.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setParamsFeedback({ type: "error", text: msg });
    } finally {
      setIsUpdatingParams(false);
    }
  };

  // Compile unified activity history items
  interface TimelineItem {
    id: string;
    title: string;
    badge: string;
    badgeColor: "emerald" | "amber" | "indigo" | "zinc";
    description: string;
    author: string;
    timestamp: Date | string;
  }

  const timelineItems: TimelineItem[] = [];

  // Add platform update histories
  platformUpdateHistories.forEach((h) => {
    const isLms = h.platform === "TRUSKILL_LMS";
    const isPub = h.action === "PUBLISHED" || h.action === "LISTED";
    timelineItems.push({
      id: `plat-${h.id}`,
      title: isLms
        ? isPub
          ? "Listed on Truskill LMS"
          : "Unlisted from Truskill LMS"
        : isPub
        ? "Published on Testpress"
        : h.action === "ARCHIVED"
        ? "Archived / Removed from Testpress"
        : "Testpress Status Update",
      badge: isLms ? "Truskill LMS" : "Testpress",
      badgeColor: isPub ? "emerald" : "indigo",
      description: h.changeDescription,
      author: h.confirmedByName,
      timestamp: h.createdAt,
    });
  });

  // Add version changes
  versions.forEach((v) => {
    timelineItems.push({
      id: `ver-${v.id}`,
      title: `Specification Version v${v.versionNumber}`,
      badge: `v${v.versionNumber}`,
      badgeColor: "indigo",
      description: v.changeDescription,
      author: v.changedByName,
      timestamp: v.createdAt,
    });
  });

  // Add audit logs that aren't duplicates
  auditLogs.forEach((a) => {
    if (!timelineItems.some((t) => t.description === a.changeDescription)) {
      timelineItems.push({
        id: `audit-${a.id}`,
        title: a.action.replace(/_/g, " "),
        badge: "Audit Event",
        badgeColor: "zinc",
        description: a.changeDescription,
        author: a.changedByName,
        timestamp: a.createdAt,
      });
    }
  });

  // Sort timeline chronologically descending
  timelineItems.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-8">
      {/* 1. HERO HEADER WITH 1-CLICK COPY FOR TESTPRESS */}
      <div className="craft-card p-6 md:p-8 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                #{exam.uniqueCode}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[var(--bg-raised)] text-[var(--text-primary)] border border-[var(--border-hairline)]">
                v{exam.currentVersion}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border ${
                  isLmsListed
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : isTestpressPublished
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                    : isTestpressArchived
                    ? "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                }`}
              >
                {isLmsListed
                  ? "Live on Truskill LMS"
                  : isTestpressPublished
                  ? "Published on Testpress"
                  : isTestpressArchived
                  ? "Archived"
                  : "Draft"}
              </span>
            </div>

            <div className="pt-1">
              <span className="text-xs font-mono text-[var(--text-muted)] block mb-1">
                Standardized Deterministic Test Title (Use this title in Testpress)
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[var(--text-primary)] break-all">
                {exam.generatedName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] pt-1">
              <div className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                {exam.category === "GLOBAL" ? (
                  <Globe className="h-4 w-4 text-indigo-500" strokeWidth={1.5} />
                ) : exam.category === "COLLEGE_TRAINING" ? (
                  <GraduationCap className="h-4 w-4 text-indigo-500" strokeWidth={1.5} />
                ) : (
                  <Briefcase className="h-4 w-4 text-indigo-500" strokeWidth={1.5} />
                )}
                <span>
                  {exam.college
                    ? `${exam.college.name} (${exam.college.code})`
                    : "Global Platform Assessment"}
                </span>
              </div>
              <span>•</span>
              <span className="font-mono">{exam.durationMinutes} mins</span>
              <span>•</span>
              <span className="font-mono">{exam.totalMarks} marks</span>
              <span>•</span>
              <span className="font-mono text-[var(--text-muted)]">
                Registered {formatDateKolkata(exam.createdAt)}
              </span>
            </div>
          </div>

          {/* Prominent Copy Button for Testpress */}
          <div className="shrink-0 flex items-center">
            <button
              type="button"
              onClick={handleCopyName}
              className={`h-12 px-6 rounded-xl font-medium text-sm transition-all duration-150 inline-flex items-center gap-2.5 shadow-sm ${
                copied
                  ? "bg-emerald-600 text-white border border-emerald-600"
                  : "craft-button-primary"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>Copied for Testpress!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" strokeWidth={1.5} />
                  <span>Copy Name for Testpress</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. DIRECT PLATFORM DELIVERY & OBSERVABILITY BAR */}
      <div className="space-y-4">
        {platformFeedback && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
              platformFeedback.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            }`}
          >
            {platformFeedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" strokeWidth={1.5} />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" strokeWidth={1.5} />
            )}
            <span>{platformFeedback.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform Node 1: Testpress Delivery */}
          <div className="craft-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  1. Testpress Test Status
                </h3>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                  isTestpressPublished
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : isTestpressArchived
                    ? "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                    : "bg-[var(--bg-raised)] text-[var(--text-muted)] border-[var(--border-hairline)]"
                }`}
              >
                {isTestpressPublished ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.5} />
                    Published on Testpress
                  </>
                ) : isTestpressArchived ? (
                  <>
                    <Archive className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} />
                    Archived from Testpress
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" strokeWidth={1.5} />
                    Draft in Testpress
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Create and configure the test in Testpress using the copied name and mirrored section questions, then mark its state here.
            </p>

            {/* Attribution note */}
            <div className="p-3 bg-[var(--bg-raised)] rounded-lg text-xs font-mono text-[var(--text-secondary)] border border-[var(--border-hairline)]">
              {isTestpressPublished ? (
                <span>
                  ✓ Published by{" "}
                  <strong className="text-[var(--text-primary)]">
                    {platformStatus?.testpressCompletedByName || "Operator"}
                  </strong>{" "}
                  on {formatDateKolkata(platformStatus?.testpressCompletedAt)}
                </span>
              ) : isTestpressArchived ? (
                <span>Test archived and removed from active delivery on Testpress.</span>
              ) : (
                <span>Draft status: Click below once you publish the test on Testpress.</span>
              )}
            </div>

            {/* Direct 1-Click State Actions */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {!isTestpressPublished && (
                <button
                  type="button"
                  disabled={isUpdatingTestpress}
                  onClick={() => handleSetTestpressStatus("PUBLISHED")}
                  className="craft-button-primary h-9 px-4 text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Mark as Published on Testpress
                </button>
              )}

              {isTestpressPublished && (
                <>
                  <button
                    type="button"
                    disabled={isUpdatingTestpress}
                    onClick={() => handleSetTestpressStatus("DRAFT")}
                    className="craft-button-secondary h-9 px-3.5 text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Revert to Draft
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingTestpress}
                    onClick={() => handleSetTestpressStatus("ARCHIVED")}
                    className="craft-button-secondary h-9 px-3.5 text-xs font-medium inline-flex items-center gap-1.5 text-red-500 hover:text-red-600"
                  >
                    <Archive className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Archive / Remove from Testpress
                  </button>
                </>
              )}

              {isTestpressArchived && (
                <>
                  <button
                    type="button"
                    disabled={isUpdatingTestpress}
                    onClick={() => handleSetTestpressStatus("PUBLISHED")}
                    className="craft-button-primary h-9 px-4 text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Restore to Published
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingTestpress}
                    onClick={() => handleSetTestpressStatus("DRAFT")}
                    className="craft-button-secondary h-9 px-3.5 text-xs font-medium"
                  >
                    Reset to Draft
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Platform Node 2: Truskill LMS Listing Checkbox */}
          <div className="craft-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  2. Truskill LMS Listing Check
                </h3>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                  isLmsListed
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-[var(--bg-raised)] text-[var(--text-muted)] border-[var(--border-hairline)]"
                }`}
              >
                {isLmsListed ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.5} />
                    Listed on Truskill LMS
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" strokeWidth={1.5} />
                    Not Listed
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              When this test is linked and listed in your Truskill LMS portal for student batches, simply check the box below.
            </p>

            {/* Direct Interactive Listing Checkbox */}
            <div className="p-4 bg-[var(--bg-raised)] rounded-xl border border-[var(--border-hairline)] flex items-center justify-between gap-4">
              <label
                htmlFor="truskill-lms-checkbox"
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <input
                  id="truskill-lms-checkbox"
                  type="checkbox"
                  checked={isLmsListed}
                  disabled={isUpdatingLms}
                  onChange={(e) => handleToggleLms(e.target.checked)}
                  className="h-5 w-5 rounded border-[var(--border-hairline)] text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Listed on Truskill LMS
                </span>
              </label>

              <span className="text-xs font-mono text-[var(--text-muted)]">
                {isUpdatingLms ? "Updating..." : isLmsListed ? "Active" : "Pending check"}
              </span>
            </div>

            {/* Attribution note */}
            <div className="text-xs font-mono text-[var(--text-muted)] pt-1">
              {isLmsListed ? (
                <span>
                  ✓ Active since {formatDateKolkata(platformStatus?.lmsCompletedAt)} by{" "}
                  <strong className="text-[var(--text-primary)]">
                    {platformStatus?.lmsCompletedByName || "Operator"}
                  </strong>
                </span>
              ) : (
                <span>Single toggle: Check the box as soon as listed in Truskill LMS.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION & TOPIC COMPOSITION MATRIX */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-500" strokeWidth={1.5} />
              Section & Topic Question Composition
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Mirror the sections, subjects, topics, and difficulty tier allocations you configured in Testpress. Save updates anytime with zero mandatory text prompts.
            </p>
          </div>
        </div>

        <CompositionBuilder
          examId={exam.id}
          isCompletedExam={isTestpressPublished || isLmsListed}
          subjects={subjects}
          initialSections={sections}
        />
      </div>

      {/* 4. DELIVERY PARAMETERS & SCORING (CLEAN ACCORDION) */}
      <div className="craft-card overflow-hidden">
        <button
          type="button"
          onClick={() => setIsParamsOpen(!isParamsOpen)}
          className="w-full px-6 py-4 bg-[var(--bg-raised)] flex items-center justify-between hover:bg-[var(--bg-raised)]/80 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Settings className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Delivery Parameters & Scoring Rules
            </h3>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              ({exam.durationMinutes}m • {exam.totalMarks} marks • {exam.testType.toLowerCase()})
            </span>
          </div>
          <div className="text-[var(--text-muted)]">
            {isParamsOpen ? (
              <ChevronUp className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
            )}
          </div>
        </button>

        {isParamsOpen && (
          <form onSubmit={handleSaveParameters} className="p-6 space-y-6 border-t border-[var(--border-hairline)]">
            {paramsFeedback && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                  paramsFeedback.type === "success"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                }`}
              >
                {paramsFeedback.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" strokeWidth={1.5} />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" strokeWidth={1.5} />
                )}
                <span>{paramsFeedback.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Descriptive Title (Preserves sequence code)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Access Visibility
                </label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value as "PUBLIC" | "PRIVATE")}
                  className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none transition-colors"
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
                  className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] font-mono tabular-nums focus:border-indigo-500 focus:outline-none transition-colors"
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
                  className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] font-mono tabular-nums focus:border-indigo-500 focus:outline-none transition-colors"
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
                  className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] font-mono tabular-nums focus:border-indigo-500 focus:outline-none transition-colors"
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
                  className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] font-mono tabular-nums focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingParams}
                className="craft-button-primary h-10 px-6 text-sm font-medium inline-flex items-center gap-2"
              >
                <Save className="h-4 w-4" strokeWidth={1.5} />
                {isUpdatingParams ? "Saving Parameters..." : "Save Parameters"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 5. TEST ACTIVITY & CHANGE HISTORY LEDGER */}
      <div className="craft-card overflow-hidden">
        <div className="px-6 py-4 bg-[var(--bg-raised)] border-b border-[var(--border-hairline)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Test Activity & Change History
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {timelineItems.length} recorded events
          </span>
        </div>

        {timelineItems.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--text-muted)] font-mono">
            No activity events recorded yet
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-hairline)]">
            {timelineItems.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-[var(--bg-raised)]/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${
                        item.badgeColor === "emerald"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : item.badgeColor === "indigo"
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                          : "bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-hairline)]"
                      }`}
                    >
                      {item.badge}
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0 font-mono text-xs text-[var(--text-muted)]">
                  <div className="font-medium text-[var(--text-primary)]">
                    by {item.author}
                  </div>
                  <div>{formatDateKolkata(item.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
