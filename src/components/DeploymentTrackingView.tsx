"use client";

import { useState } from "react";
import {
  markTestpressCompletedAction,
  markLmsCompletedAction,
  confirmPlatformUpdateAction,
} from "@/app/actions/examActions";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  History,
} from "lucide-react";
import { formatDateKolkata } from "@/lib/utils";

interface PlatformStatusData {
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
}

interface UpdateHistoryItem {
  id: string;
  platform: string;
  action: string;
  changeDescription: string;
  confirmedByName: string;
  createdAt: Date | string;
}

interface DeploymentTrackingViewProps {
  examId: string;
  overallStatus: string;
  platformStatus: PlatformStatusData | null;
  updateHistories: UpdateHistoryItem[];
}

export default function DeploymentTrackingView({
  examId,
  platformStatus,
  updateHistories,
}: DeploymentTrackingViewProps) {
  const [testpressNotes, setTestpressNotes] = useState("");
  const [lmsNotes, setLmsNotes] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isTestpressDone = platformStatus?.testpressStatus === "COMPLETED";
  const isLmsDone = platformStatus?.lmsStatus === "COMPLETED";

  const handleAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await fn();
      setFeedback({ type: "success", text: successMsg });
      setTestpressNotes("");
      setLmsNotes("");
      setUpdateNotes("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({ type: "error", text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-3.5 rounded-lg flex items-center gap-2.5 text-xs ${
            feedback.type === "success"
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
              : "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-zinc-100 shrink-0" strokeWidth={1.5} />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" strokeWidth={1.5} />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Subsequent Update Required Banner */}
      {(platformStatus?.testpressUpdatePending || platformStatus?.lmsUpdatePending) && (
        <div className="craft-card p-6 space-y-4 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2.5 text-[var(--text-primary)] text-sm font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>External Platform Synchronization Required</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            This examination composition or metadata was modified after initial release. Please apply the changes directly in external test delivery portals and confirm the audit completion below.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Mandatory Confirmation Remarks <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="e.g. Updated question count from 40 to 45 on Testpress portal"
              className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-amber-500 focus:outline-none transition-colors duration-150"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {platformStatus?.testpressUpdatePending && (
              <button
                type="button"
                disabled={isSubmitting || !updateNotes.trim()}
                onClick={() =>
                  handleAction(
                    () =>
                      confirmPlatformUpdateAction({
                        examId,
                        platform: "TESTPRESS",
                        changeDescription: updateNotes,
                      }),
                    "Testpress update confirmed."
                  )
                }
                className="craft-button-primary inline-flex items-center gap-2 h-10 px-5 text-xs font-medium disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                Confirm Testpress Updated
              </button>
            )}

            {platformStatus?.lmsUpdatePending && (
              <button
                type="button"
                disabled={isSubmitting || !updateNotes.trim()}
                onClick={() =>
                  handleAction(
                    () =>
                      confirmPlatformUpdateAction({
                        examId,
                        platform: "TRUSKILL_LMS",
                        changeDescription: updateNotes,
                      }),
                    "Truskill LMS update confirmed."
                  )
                }
                className="craft-button-primary inline-flex items-center gap-2 h-10 px-5 text-xs font-medium disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                Confirm Truskill LMS Updated
              </button>
            )}
          </div>
        </div>
      )}

      {/* Two-Stage Deployment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stage 1: Testpress Creation */}
        <div className="craft-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-[var(--bg-raised)] text-[var(--text-primary)] border border-[var(--border-hairline)]">
                Stage 1
              </span>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Testpress Creation</h3>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
              isTestpressDone
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-[var(--bg-raised)] text-[var(--text-muted)] border-[var(--border-hairline)]"
            }`}>
              {isTestpressDone ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={1.5} /> Completed
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} /> Pending
                </>
              )}
            </span>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Create assessment container on Testpress matching standardized title, section allocations, duration, and marking scheme.
          </p>

          {isTestpressDone ? (
            <div className="p-4 bg-[var(--bg-raised)] rounded-xl border border-[var(--border-hairline)] space-y-2 text-sm">
              <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs">
                <span>Completed by <strong className="text-[var(--text-primary)] font-semibold">{platformStatus?.testpressCompletedByName}</strong></span>
                <span className="font-mono">{formatDateKolkata(platformStatus?.testpressCompletedAt)}</span>
              </div>
              {platformStatus?.testpressNotes && (
                <div className="text-[var(--text-primary)] pt-2 border-t border-[var(--border-hairline)] text-xs">
                  Remarks: &quot;{platformStatus.testpressNotes}&quot;
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Optional Remarks / Reference ID
                </label>
                <input
                  type="text"
                  value={testpressNotes}
                  onChange={(e) => setTestpressNotes(e.target.value)}
                  placeholder="e.g. Created on Testpress portal with 32 questions"
                  className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors duration-150"
                />
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  handleAction(
                    () =>
                      markTestpressCompletedAction({
                        examId,
                        notes: testpressNotes,
                      }),
                    "Testpress creation marked completed."
                  )
                }
                className="craft-button-primary w-full inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                Mark Testpress Completed
              </button>
            </div>
          )}
        </div>

        {/* Stage 2: Truskill LMS Listing */}
        <div
          className={`craft-card p-6 space-y-5 transition-colors duration-150 ${
            !isTestpressDone ? "opacity-60" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-[var(--bg-raised)] text-[var(--text-primary)] border border-[var(--border-hairline)]">
                Stage 2
              </span>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Truskill LMS Listing</h3>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
              isLmsDone
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-[var(--bg-raised)] text-[var(--text-muted)] border-[var(--border-hairline)]"
            }`}>
              {isLmsDone ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={1.5} /> Completed
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} /> Pending
                </>
              )}
            </span>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            List assessment on Truskill LMS with delivery dates, attempt policies, batch enrollments, and cohort accessibility.
          </p>

          {!isTestpressDone ? (
            <div className="p-4 bg-[var(--bg-raised)] rounded-xl text-xs font-mono text-[var(--text-secondary)] flex items-center gap-2.5 border border-[var(--border-hairline)]">
              <Clock className="h-4 w-4 shrink-0 text-amber-500" strokeWidth={1.5} />
              <span>Prerequisite: Truskill LMS listing requires Testpress completion first</span>
            </div>
          ) : isLmsDone ? (
            <div className="p-4 bg-[var(--bg-raised)] rounded-xl border border-[var(--border-hairline)] space-y-2 text-sm">
              <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs">
                <span>Completed by <strong className="text-[var(--text-primary)] font-semibold">{platformStatus?.lmsCompletedByName}</strong></span>
                <span className="font-mono">{formatDateKolkata(platformStatus?.lmsCompletedAt)}</span>
              </div>
              {platformStatus?.lmsNotes && (
                <div className="text-[var(--text-primary)] pt-2 border-t border-[var(--border-hairline)] text-xs">
                  Remarks: &quot;{platformStatus.lmsNotes}&quot;
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Optional Remarks / LMS Course Link
                </label>
                <input
                  type="text"
                  value={lmsNotes}
                  onChange={(e) => setLmsNotes(e.target.value)}
                  placeholder="e.g. Published on LMS for Spring 2026 Batch"
                  className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors duration-150"
                />
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  handleAction(
                    () =>
                      markLmsCompletedAction({
                        examId,
                        notes: lmsNotes,
                      }),
                    "Truskill LMS listing marked completed."
                  )
                }
                className="craft-button-primary w-full inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                Mark Truskill LMS Completed
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subsequent Platform Update History */}
      <div className="craft-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-hairline)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Deployment Confirmation Ledger
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {updateHistories.length} records
          </span>
        </div>

        {updateHistories.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--text-muted)] font-mono">
            No subsequent platform updates recorded
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-raised)] text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
              <tr>
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4 text-center">Action</th>
                <th className="py-3 px-4">Confirmed By</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {updateHistories.map((h) => (
                <tr key={h.id} className="hover:bg-[var(--bg-raised)]/40 transition-colors duration-150">
                  <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                    {formatDateKolkata(h.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                    {h.platform === "TESTPRESS" ? "Testpress" : "Truskill LMS"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                      {h.action.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                    {h.confirmedByName}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                    {h.changeDescription}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
