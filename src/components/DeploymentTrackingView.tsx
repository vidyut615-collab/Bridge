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
  AlertTriangle,
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
              ? "bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
              : "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Subsequent Update Required Banner */}
      {(platformStatus?.testpressUpdatePending || platformStatus?.lmsUpdatePending) && (
        <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-zinc-950 dark:text-zinc-50 font-semibold text-xs">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
            </span>
            <span>External Platform Updates Required</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            This examination was modified after its initial completion. Staff must perform the updates on Testpress and/or Truskill LMS and confirm them independently below.
          </p>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider">
              Mandatory Confirmation Remarks <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="e.g. Updated questions count from 40 to 45 on Testpress dashboard."
              className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
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
                    "Testpress update confirmed successfully."
                  )
                }
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 shadow-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
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
                    "Truskill LMS update confirmed successfully."
                  )
                }
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 shadow-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Confirm Truskill LMS Updated
              </button>
            )}
          </div>
        </div>
      )}

      {/* Two-Stage Deployment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stage 1: Testpress Creation */}
        <div className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
                Stage 1
              </span>
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Testpress Creation</h3>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
              isTestpressDone
                ? "bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
            }`}>
              {isTestpressDone ? (
                <>
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" /> Pending
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-zinc-500">
            Create the examination on Testpress using the generated name, matching questions, duration, and marking scheme.
          </p>

          {isTestpressDone ? (
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 space-y-1 text-xs">
              <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                <span>Completed by <strong className="text-zinc-900 dark:text-zinc-100">{platformStatus?.testpressCompletedByName}</strong></span>
                <span className="font-mono">{formatDateKolkata(platformStatus?.testpressCompletedAt)}</span>
              </div>
              {platformStatus?.testpressNotes && (
                <div className="text-zinc-800 dark:text-zinc-200 font-medium pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
                  Notes: &quot;{platformStatus.testpressNotes}&quot;
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1">
                  Optional Remarks / Notes
                </label>
                <input
                  type="text"
                  value={testpressNotes}
                  onChange={(e) => setTestpressNotes(e.target.value)}
                  placeholder="e.g. Created on Testpress portal with 32 questions."
                  className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
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
                className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark Testpress Completed
              </button>
            </div>
          )}
        </div>

        {/* Stage 2: Truskill LMS Listing */}
        <div
          className={`p-5 rounded-xl border transition shadow-xs space-y-4 ${
            !isTestpressDone
              ? "bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-60"
              : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
                Stage 2
              </span>
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Truskill LMS Listing</h3>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
              isLmsDone
                ? "bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
            }`}>
              {isLmsDone ? (
                <>
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" /> Pending
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-zinc-500">
            List the assessment on Truskill LMS with schedule dates, attempt policies, and public/private access.
          </p>

          {!isTestpressDone ? (
            <div className="p-3 bg-zinc-100/70 dark:bg-zinc-800/50 rounded-lg text-xs font-medium text-zinc-500 flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
              <span>Strict Rule: Truskill LMS listing cannot be completed before Testpress creation.</span>
            </div>
          ) : isLmsDone ? (
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 space-y-1 text-xs">
              <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                <span>Completed by <strong className="text-zinc-900 dark:text-zinc-100">{platformStatus?.lmsCompletedByName}</strong></span>
                <span className="font-mono">{formatDateKolkata(platformStatus?.lmsCompletedAt)}</span>
              </div>
              {platformStatus?.lmsNotes && (
                <div className="text-zinc-800 dark:text-zinc-200 font-medium pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
                  Notes: &quot;{platformStatus.lmsNotes}&quot;
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider mb-1">
                  Optional Remarks / Notes
                </label>
                <input
                  type="text"
                  value={lmsNotes}
                  onChange={(e) => setLmsNotes(e.target.value)}
                  placeholder="e.g. Published on LMS for Spring 2026 Batch."
                  className="h-9 w-full px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
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
                    "Truskill LMS listing marked completed. Overall status is now COMPLETED!"
                  )
                }
                className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark Truskill LMS Completed
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subsequent Platform Update History */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Platform Deployment History</h2>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            {updateHistories.length} activity records
          </span>
        </div>

        {updateHistories.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No subsequent platform updates recorded yet.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 uppercase font-mono tracking-wider text-[11px] text-zinc-500 border-b border-zinc-200/80 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Date & Time</th>
                <th className="py-2.5 px-4 font-medium">Platform</th>
                <th className="py-2.5 px-4 text-center font-medium">Action</th>
                <th className="py-2.5 px-4 font-medium">Confirmed By</th>
                <th className="py-2.5 px-4 font-medium">Change Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {updateHistories.map((h) => (
                <tr key={h.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                    {formatDateKolkata(h.createdAt)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-zinc-50">
                    {h.platform === "TESTPRESS" ? "Testpress" : "Truskill LMS"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700">
                      {h.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                    {h.confirmedByName}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
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
