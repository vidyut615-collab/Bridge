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
          className={`p-4 rounded-xl flex items-center gap-2.5 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/30"
              : "bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-[#eb5757] border border-rose-200 dark:border-rose-500/30"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-[#27a644] shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-[#eb5757] shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Subsequent Update Required Banner (PRD Section 14) */}
      {(platformStatus?.testpressUpdatePending || platformStatus?.lmsUpdatePending) && (
        <div className="bg-amber-50 dark:bg-[#f0bf00]/10 border border-amber-200 dark:border-[#f0bf00]/25 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-[#f0bf00] font-bold text-base">
            <AlertTriangle className="h-5 w-5 text-[#f0bf00]" />
            <span>Subsequent Platform Update Required</span>
          </div>
          <p className="text-xs text-amber-800 dark:text-[#f0bf00]/90">
            This examination was modified after its initial completion. Staff must perform the updates on Testpress and/or Truskill LMS and confirm them independently below.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-[#d0d3d8] uppercase tracking-wider">
              Mandatory Confirmation Notes <span className="text-[#eb5757]">*</span>
            </label>
            <input
              type="text"
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="e.g. Updated questions count from 40 to 45 on Testpress dashboard."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 dark:border-[#f0bf00]/30 bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
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
                    "Testpress update confirmed successfully."
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs disabled:opacity-50 transition shadow-xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Testpress Updated
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs disabled:opacity-50 transition shadow-xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Truskill LMS Updated
              </button>
            )}
          </div>
        </div>
      )}

      {/* Linear Two-Stage Deployment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stage 1: Testpress Creation */}
        <div
          className={`p-6 rounded-2xl border transition shadow-xs space-y-4 ${
            isTestpressDone
              ? "bg-emerald-50/20 dark:bg-emerald-500/[0.04] border-emerald-200 dark:border-emerald-500/20"
              : "bg-white dark:bg-[#0f1011] border-slate-200 dark:border-white/[0.08]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-[#d0d3d8] border border-slate-200 dark:border-white/[0.08]">
                Stage 1
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">Testpress Creation</h3>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                isTestpressDone
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/20"
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-[#f0bf00] border border-amber-200 dark:border-amber-500/20"
              }`}
            >
              {isTestpressDone ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5" /> Pending
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-[#8a8f98]">
            Create the examination on Testpress using the generated name, matching questions, duration, and marking scheme.
          </p>

          {isTestpressDone ? (
            <div className="p-3.5 bg-white dark:bg-[#141516] rounded-xl border border-emerald-100 dark:border-emerald-500/20 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-[#8a8f98] text-[11px]">
                <span>Completed by <strong className="text-slate-800 dark:text-[#f7f8f8]">{platformStatus?.testpressCompletedByName}</strong></span>
                <span className="font-mono">{formatDateKolkata(platformStatus?.testpressCompletedAt)}</span>
              </div>
              {platformStatus?.testpressNotes && (
                <div className="text-slate-700 dark:text-[#d0d3d8] font-medium pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                  Notes: &quot;{platformStatus.testpressNotes}&quot;
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
                  Optional Remarks / Notes
                </label>
                <input
                  type="text"
                  value={testpressNotes}
                  onChange={(e) => setTestpressNotes(e.target.value)}
                  placeholder="e.g. Created on Testpress portal with 32 questions."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
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
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5e6ad2] hover:bg-[#6875e5] text-white font-semibold text-xs shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.35)] transition disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Testpress Completed
              </button>
            </div>
          )}
        </div>

        {/* Stage 2: Truskill LMS Listing */}
        <div
          className={`p-6 rounded-2xl border transition shadow-xs space-y-4 ${
            isLmsDone
              ? "bg-emerald-50/20 dark:bg-emerald-500/[0.04] border-emerald-200 dark:border-emerald-500/20"
              : !isTestpressDone
              ? "bg-slate-50 dark:bg-[#141516]/40 border-slate-200 dark:border-white/[0.06] opacity-60 cursor-not-allowed"
              : "bg-white dark:bg-[#0f1011] border-slate-200 dark:border-white/[0.08]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-[#d0d3d8] border border-slate-200 dark:border-white/[0.08]">
                Stage 2
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">Truskill LMS Listing</h3>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                isLmsDone
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/20"
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-[#f0bf00] border border-amber-200 dark:border-amber-500/20"
              }`}
            >
              {isLmsDone ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5" /> Pending
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-[#8a8f98]">
            List the assessment on Truskill LMS with schedule dates, attempt policies, and public/private access.
          </p>

          {!isTestpressDone ? (
            <div className="p-3.5 bg-slate-100 dark:bg-[#141516] rounded-xl text-xs font-semibold text-slate-500 dark:text-[#8a8f98] flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400 dark:text-[#62666d]" />
              <span>Strict Rule: Truskill LMS listing cannot be completed before Testpress creation.</span>
            </div>
          ) : isLmsDone ? (
            <div className="p-3.5 bg-white dark:bg-[#141516] rounded-xl border border-emerald-100 dark:border-emerald-500/20 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-[#8a8f98] text-[11px]">
                <span>Completed by <strong className="text-slate-800 dark:text-[#f7f8f8]">{platformStatus?.lmsCompletedByName}</strong></span>
                <span className="font-mono">{formatDateKolkata(platformStatus?.lmsCompletedAt)}</span>
              </div>
              {platformStatus?.lmsNotes && (
                <div className="text-slate-700 dark:text-[#d0d3d8] font-medium pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                  Notes: &quot;{platformStatus.lmsNotes}&quot;
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
                  Optional Remarks / Notes
                </label>
                <input
                  type="text"
                  value={lmsNotes}
                  onChange={(e) => setLmsNotes(e.target.value)}
                  placeholder="e.g. Published on LMS for Spring 2026 Batch."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
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
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5e6ad2] hover:bg-[#6875e5] text-white font-semibold text-xs shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.35)] transition disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Truskill LMS Completed
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subsequent Platform Update History (PRD Section 14.3) */}
      <div className="bg-white dark:bg-[#0f1011] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#5e6ad2] dark:text-[#8b95f6]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">Platform Deployment History</h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-[#8a8f98] font-mono">
            {updateHistories.length} activity records
          </span>
        </div>

        {updateHistories.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400 dark:text-[#62666d]">
            No subsequent platform updates recorded yet.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#141516] uppercase font-semibold text-slate-600 dark:text-[#8a8f98] border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-2.5 px-4">Date & Time</th>
                <th className="py-2.5 px-4">Platform</th>
                <th className="py-2.5 px-4 text-center">Action</th>
                <th className="py-2.5 px-4">Confirmed By</th>
                <th className="py-2.5 px-4">Change Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {updateHistories.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition">
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-[#8a8f98] whitespace-nowrap">
                    {formatDateKolkata(h.createdAt)}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-[#d0d3d8]">
                    {h.platform === "TESTPRESS" ? "Testpress" : "Truskill LMS"}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        h.action === "UPDATE_CONFIRMED"
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/20"
                          : "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-[#f0bf00] border border-amber-200 dark:border-amber-500/20"
                      }`}
                    >
                      {h.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700 dark:text-[#d0d3d8]">
                    {h.confirmedByName}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-[#8a8f98] font-medium">
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
