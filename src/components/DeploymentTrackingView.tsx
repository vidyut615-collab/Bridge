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
        <div className="bg-white dark:bg-[#19191b] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>External platform synchronization required</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            This examination specification was modified after initial deployment. Perform updates on external portals and confirm below.
          </p>

          <div className="space-y-1">
            <label className="block text-xs text-zinc-500 font-normal">
              Mandatory confirmation remarks <span className="text-zinc-400">*</span>
            </label>
            <input
              type="text"
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="e.g. Updated question count from 40 to 45 on Testpress"
              className="h-8 w-full px-3 text-xs rounded-md border border-black/[0.08] dark:border-white/[0.08] bg-[#f4f4f5] dark:bg-[#232325] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors duration-150"
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
                    "Testpress update confirmed."
                  )
                }
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-150 disabled:opacity-50 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)]"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                Confirm Testpress updated
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
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-150 disabled:opacity-50 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)]"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                Confirm Truskill LMS updated
              </button>
            )}
          </div>
        </div>
      )}

      {/* Two-Stage Deployment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stage 1: Testpress Creation */}
        <div className="p-5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#19191b] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-normal bg-[#f4f4f5] dark:bg-[#232325] text-zinc-700 dark:text-zinc-300 border border-black/[0.08] dark:border-white/[0.08]">
                Stage 1
              </span>
              <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Testpress creation</h3>
            </div>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
              isTestpressDone
                ? "bg-[#f4f4f5] dark:bg-[#232325] text-zinc-800 dark:text-zinc-200 border-black/[0.08] dark:border-white/[0.08]"
                : "bg-transparent text-zinc-500 border-black/[0.08] dark:border-white/[0.08]"
            }`}>
              {isTestpressDone ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Completed
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.5} /> Pending
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-zinc-500">
            Create examination on Testpress matching name, question allocations, duration, and marking scheme.
          </p>

          {isTestpressDone ? (
            <div className="p-3 bg-[#f4f4f5] dark:bg-[#232325] rounded-lg border border-black/[0.08] dark:border-white/[0.08] space-y-1 text-xs">
              <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                <span>Completed by <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{platformStatus?.testpressCompletedByName}</strong></span>
                <span className="font-mono">{formatDateKolkata(platformStatus?.testpressCompletedAt)}</span>
              </div>
              {platformStatus?.testpressNotes && (
                <div className="text-zinc-800 dark:text-zinc-200 font-normal pt-1 border-t border-black/[0.06] dark:border-white/[0.06]">
                  Notes: &quot;{platformStatus.testpressNotes}&quot;
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block text-xs text-zinc-500 mb-1 font-normal">
                  Optional remarks / notes
                </label>
                <input
                  type="text"
                  value={testpressNotes}
                  onChange={(e) => setTestpressNotes(e.target.value)}
                  placeholder="e.g. Created on Testpress portal with 32 questions"
                  className="h-8 w-full px-3 text-xs rounded-md border border-black/[0.08] dark:border-white/[0.08] bg-[#f4f4f5] dark:bg-[#232325] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors duration-150"
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
                className="w-full inline-flex items-center justify-center gap-1.5 h-8 px-4 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-150 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)] disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                Mark Testpress completed
              </button>
            </div>
          )}
        </div>

        {/* Stage 2: Truskill LMS Listing */}
        <div
          className={`p-5 rounded-xl border transition-colors duration-150 space-y-4 ${
            !isTestpressDone
              ? "bg-[#f4f4f5]/40 dark:bg-[#19191b]/40 border-black/[0.08] dark:border-white/[0.08] opacity-60"
              : "bg-white dark:bg-[#19191b] border-black/[0.08] dark:border-white/[0.08]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-normal bg-[#f4f4f5] dark:bg-[#232325] text-zinc-700 dark:text-zinc-300 border border-black/[0.08] dark:border-white/[0.08]">
                Stage 2
              </span>
              <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Truskill LMS listing</h3>
            </div>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
              isLmsDone
                ? "bg-[#f4f4f5] dark:bg-[#232325] text-zinc-800 dark:text-zinc-200 border-black/[0.08] dark:border-white/[0.08]"
                : "bg-transparent text-zinc-500 border-black/[0.08] dark:border-white/[0.08]"
            }`}>
              {isLmsDone ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Completed
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.5} /> Pending
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-zinc-500">
            List assessment on Truskill LMS with schedule dates, attempt policies, and cohort accessibility.
          </p>

          {!isTestpressDone ? (
            <div className="p-3 bg-[#f4f4f5] dark:bg-[#232325] rounded-lg text-xs font-mono text-zinc-500 flex items-center gap-2 border border-black/[0.08] dark:border-white/[0.08]">
              <Clock className="h-4 w-4 shrink-0 text-zinc-400" strokeWidth={1.5} />
              <span>Dependency: Truskill LMS listing requires Testpress completion first</span>
            </div>
          ) : isLmsDone ? (
            <div className="p-3 bg-[#f4f4f5] dark:bg-[#232325] rounded-lg border border-black/[0.08] dark:border-white/[0.08] space-y-1 text-xs">
              <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                <span>Completed by <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{platformStatus?.lmsCompletedByName}</strong></span>
                <span className="font-mono">{formatDateKolkata(platformStatus?.lmsCompletedAt)}</span>
              </div>
              {platformStatus?.lmsNotes && (
                <div className="text-zinc-800 dark:text-zinc-200 font-normal pt-1 border-t border-black/[0.06] dark:border-white/[0.06]">
                  Notes: &quot;{platformStatus.lmsNotes}&quot;
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block text-xs text-zinc-500 mb-1 font-normal">
                  Optional remarks / notes
                </label>
                <input
                  type="text"
                  value={lmsNotes}
                  onChange={(e) => setLmsNotes(e.target.value)}
                  placeholder="e.g. Published on LMS for Spring 2026 Batch"
                  className="h-8 w-full px-3 text-xs rounded-md border border-black/[0.08] dark:border-white/[0.08] bg-[#f4f4f5] dark:bg-[#232325] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors duration-150"
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
                className="w-full inline-flex items-center justify-center gap-1.5 h-8 px-4 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-150 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)] disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                Mark Truskill LMS completed
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subsequent Platform Update History */}
      <div className="bg-white dark:bg-[#19191b] rounded-xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden">
        <div className="p-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            <h2 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              Deployment confirmation ledger
            </h2>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            {updateHistories.length} records
          </span>
        </div>

        {updateHistories.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 font-mono">
            No subsequent platform updates recorded
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f4f5] dark:bg-[#232325] text-[11px] font-mono text-zinc-500 border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-2.5 px-4 font-normal">Timestamp (IST)</th>
                <th className="py-2.5 px-4 font-normal">Platform</th>
                <th className="py-2.5 px-4 text-center font-normal">Action</th>
                <th className="py-2.5 px-4 font-normal">Confirmed by</th>
                <th className="py-2.5 px-4 font-normal">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {updateHistories.map((h) => (
                <tr key={h.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-150">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                    {formatDateKolkata(h.createdAt)}
                  </td>
                  <td className="py-2.5 px-4 font-normal text-zinc-900 dark:text-zinc-100">
                    {h.platform === "TESTPRESS" ? "Testpress" : "Truskill LMS"}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#f4f4f5] dark:bg-[#232325] text-zinc-800 dark:text-zinc-200 border border-black/[0.08] dark:border-white/[0.08]">
                      {h.action.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-normal text-zinc-900 dark:text-zinc-100">
                    {h.confirmedByName}
                  </td>
                  <td className="py-2.5 px-4 text-zinc-600 dark:text-zinc-400 font-normal">
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
