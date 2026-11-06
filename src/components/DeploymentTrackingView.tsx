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
  ArrowRight,
  ShieldCheck,
  Send,
  Calendar,
  User,
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
  overallStatus,
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
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Subsequent Update Required Banner (PRD Section 14) */}
      {(platformStatus?.testpressUpdatePending || platformStatus?.lmsUpdatePending) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-base">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>Subsequent Platform Update Required</span>
          </div>
          <p className="text-xs text-amber-800">
            This examination was modified after its initial completion. Staff must perform the updates on Testpress and/or Truskill LMS and confirm them independently below.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Mandatory Confirmation Notes <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="e.g. Updated questions count from 40 to 45 on Testpress dashboard."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 bg-white"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700 disabled:opacity-50 transition shadow-xs"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 disabled:opacity-50 transition shadow-xs"
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
              ? "bg-emerald-50/20 border-emerald-200"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                Stage 1
              </span>
              <h3 className="text-base font-bold text-slate-900">Testpress Creation</h3>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isTestpressDone
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
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

          <p className="text-xs text-slate-500">
            Create the examination on Testpress using the generated name, matching questions, duration, and marking scheme.
          </p>

          {isTestpressDone ? (
            <div className="p-3.5 bg-white rounded-xl border border-emerald-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Completed by <strong className="text-slate-800">{platformStatus?.testpressCompletedByName}</strong></span>
                <span>{formatDateKolkata(platformStatus?.testpressCompletedAt)}</span>
              </div>
              {platformStatus?.testpressNotes && (
                <div className="text-slate-700 font-medium pt-1 border-t border-slate-100">
                  Notes: &quot;{platformStatus.testpressNotes}&quot;
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Remarks / Notes
                </label>
                <input
                  type="text"
                  value={testpressNotes}
                  onChange={(e) => setTestpressNotes(e.target.value)}
                  placeholder="e.g. Created on Testpress portal with 32 questions."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
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
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition shadow-xs disabled:opacity-50"
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
              ? "bg-emerald-50/20 border-emerald-200"
              : !isTestpressDone
              ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                Stage 2
              </span>
              <h3 className="text-base font-bold text-slate-900">Truskill LMS Listing</h3>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isLmsDone
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
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

          <p className="text-xs text-slate-500">
            List the assessment on Truskill LMS with schedule dates, attempt policies, and public/private access.
          </p>

          {!isTestpressDone ? (
            <div className="p-3.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Strict Rule: Truskill LMS listing cannot be completed before Testpress creation.</span>
            </div>
          ) : isLmsDone ? (
            <div className="p-3.5 bg-white rounded-xl border border-emerald-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Completed by <strong className="text-slate-800">{platformStatus?.lmsCompletedByName}</strong></span>
                <span>{formatDateKolkata(platformStatus?.lmsCompletedAt)}</span>
              </div>
              {platformStatus?.lmsNotes && (
                <div className="text-slate-700 font-medium pt-1 border-t border-slate-100">
                  Notes: &quot;{platformStatus.lmsNotes}&quot;
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Remarks / Notes
                </label>
                <input
                  type="text"
                  value={lmsNotes}
                  onChange={(e) => setLmsNotes(e.target.value)}
                  placeholder="e.g. Published on LMS for Spring 2026 Batch."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
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
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Truskill LMS Completed
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subsequent Platform Update History (PRD Section 14.3) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Platform Deployment History</h2>
          </div>
          <span className="text-xs text-slate-500">
            {updateHistories.length} activity records
          </span>
        </div>

        {updateHistories.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No subsequent platform updates recorded yet.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Date & Time</th>
                <th className="py-2.5 px-4">Platform</th>
                <th className="py-2.5 px-4 text-center">Action</th>
                <th className="py-2.5 px-4">Confirmed By</th>
                <th className="py-2.5 px-4">Change Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {updateHistories.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {formatDateKolkata(h.createdAt)}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-800">
                    {h.platform === "TESTPRESS" ? "Testpress" : "Truskill LMS"}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.action === "UPDATE_CONFIRMED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {h.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">
                    {h.confirmedByName}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 font-medium">
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
