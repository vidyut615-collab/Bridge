"use client";

import { useState } from "react";
import { updateBatchTopicsInventoryAction } from "@/app/actions/questionBankActions";
import { formatNumber } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Save, Folder } from "lucide-react";

interface TopicData {
  id: string;
  topicCode: string;
  name: string;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  folderName: string;
}

interface TopicInventoryManagerProps {
  subjectId: string;
  subjectName: string;
  initialTopics: TopicData[];
}

export default function TopicInventoryManager({
  subjectId,
  subjectName,
  initialTopics,
}: TopicInventoryManagerProps) {
  const [topics, setTopics] = useState<TopicData[]>(initialTopics);
  const [changeDescription, setChangeDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Live Aggregate calculations
  const totalEasy = topics.reduce((acc, t) => acc + (Number(t.easyCount) || 0), 0);
  const totalMedium = topics.reduce((acc, t) => acc + (Number(t.mediumCount) || 0), 0);
  const totalHard = topics.reduce((acc, t) => acc + (Number(t.hardCount) || 0), 0);
  const grandTotal = totalEasy + totalMedium + totalHard;

  const initialTotal = initialTopics.reduce(
    (acc, t) => acc + t.easyCount + t.mediumCount + t.hardCount,
    0
  );
  const totalDelta = grandTotal - initialTotal;

  const handleFieldChange = (
    topicId: string,
    field: "easyCount" | "mediumCount" | "hardCount" | "folderName",
    value: string | number
  ) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, [field]: value } : t))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeDescription.trim()) {
      setMessage({
        type: "error",
        text: "A change description is mandatory before saving topic inventories.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateBatchTopicsInventoryAction({
        subjectId,
        topics: topics.map((t) => ({
          topicId: t.id,
          easyCount: Number(t.easyCount) || 0,
          mediumCount: Number(t.mediumCount) || 0,
          hardCount: Number(t.hardCount) || 0,
          folderName: t.folderName || "",
        })),
        changeDescription,
      });

      setMessage({
        type: "success",
        text: `Successfully updated topic inventories for ${subjectName}! Subject aggregate has been recalculated.`,
      });
      setChangeDescription("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Live Aggregated Subject Summary Bar */}
      <div className="bg-white dark:bg-[#0f1011] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-white/[0.08] pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">
              Topic-Level Difficulty & Folder Inventory
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-0.5">
              Enter confirmed question counts for each topic. Subject totals below are calculated automatically as the live aggregate of all topics.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#8a8f98] uppercase tracking-wider block">
              Live Subject Grand Total
            </span>
            <div className="flex items-center justify-end gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-[#f7f8f8] font-mono">
                {formatNumber(grandTotal)}
              </span>
              {totalDelta !== 0 && (
                <span
                  className={`inline-flex items-center text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    totalDelta > 0
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-[#27a644]"
                      : "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-[#eb5757]"
                  }`}
                >
                  {totalDelta > 0 ? `+${totalDelta}` : totalDelta}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4 Rollup KPI Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-white/[0.08]">
            <span className="text-[10px] font-mono font-semibold uppercase text-slate-500 dark:text-[#8a8f98] block">
              Active Topics
            </span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-[#f7f8f8]">
              {topics.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-500/[0.06] border border-emerald-200 dark:border-emerald-500/20">
            <span className="text-[10px] font-mono font-semibold uppercase text-emerald-800 dark:text-[#27a644] block">
              Aggregate Easy (Level I)
            </span>
            <span className="text-lg font-bold font-mono text-emerald-700 dark:text-[#27a644]">
              {formatNumber(totalEasy)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-500/[0.06] border border-amber-200 dark:border-amber-500/20">
            <span className="text-[10px] font-mono font-semibold uppercase text-amber-800 dark:text-[#f0bf00] block">
              Aggregate Medium (Level II)
            </span>
            <span className="text-lg font-bold font-mono text-amber-700 dark:text-[#f0bf00]">
              {formatNumber(totalMedium)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-500/[0.06] border border-rose-200 dark:border-rose-500/20">
            <span className="text-[10px] font-mono font-semibold uppercase text-rose-800 dark:text-[#eb5757] block">
              Aggregate Hard (Level III)
            </span>
            <span className="text-lg font-bold font-mono text-rose-700 dark:text-[#eb5757]">
              {formatNumber(totalHard)}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/30"
              : "bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-[#eb5757] border border-rose-200 dark:border-rose-500/30"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-[#27a644] shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-[#eb5757] shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Topics Interactive Matrix Table */}
      <div className="bg-white dark:bg-[#0f1011] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#f7f8f8]">
            Topics Inventory Register ({topics.length} Topics)
          </h3>
          <span className="text-xs text-slate-500 dark:text-[#8a8f98]">
            Edit values in-place • Row & subject totals update in real-time
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#141516] text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-[#8a8f98] border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3 px-3 w-28">Topic Code</th>
                <th className="py-3 px-3">Topic Name</th>
                <th className="py-3 px-3 text-center w-28">Easy (I)</th>
                <th className="py-3 px-3 text-center w-28">Medium (II)</th>
                <th className="py-3 px-3 text-center w-28">Hard (III)</th>
                <th className="py-3 px-3 text-right w-24">Topic Total</th>
                <th className="py-3 px-3 w-64">Folder Name on Testpress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {topics.map((t) => {
                const rowTotal =
                  (Number(t.easyCount) || 0) +
                  (Number(t.mediumCount) || 0) +
                  (Number(t.hardCount) || 0);

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition"
                  >
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#5e6ad2] dark:text-[#8b95f6]">
                      {t.topicCode}
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-[#f7f8f8]">
                      {t.name}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono">
                      <input
                        type="number"
                        min="0"
                        required
                        value={t.easyCount}
                        onChange={(e) =>
                          handleFieldChange(t.id, "easyCount", parseInt(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 text-center font-bold text-emerald-700 dark:text-[#27a644] bg-emerald-50/30 dark:bg-emerald-500/[0.08] rounded border border-emerald-200 dark:border-emerald-500/20 focus:ring-2 focus:ring-[#27a644]"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono">
                      <input
                        type="number"
                        min="0"
                        required
                        value={t.mediumCount}
                        onChange={(e) =>
                          handleFieldChange(t.id, "mediumCount", parseInt(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 text-center font-bold text-amber-700 dark:text-[#f0bf00] bg-amber-50/30 dark:bg-amber-500/[0.08] rounded border border-amber-200 dark:border-amber-500/20 focus:ring-2 focus:ring-[#f0bf00]"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono">
                      <input
                        type="number"
                        min="0"
                        required
                        value={t.hardCount}
                        onChange={(e) =>
                          handleFieldChange(t.id, "hardCount", parseInt(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 text-center font-bold text-rose-700 dark:text-[#eb5757] bg-rose-50/30 dark:bg-rose-500/[0.08] rounded border border-rose-200 dark:border-rose-500/20 focus:ring-2 focus:ring-[#eb5757]"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-[#f7f8f8] tabular-nums text-sm">
                      {formatNumber(rowTotal)}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <Folder className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={t.folderName}
                          onChange={(e) =>
                            handleFieldChange(t.id, "folderName", e.target.value)
                          }
                          placeholder="e.g. Topic_Folder_Path"
                          className="w-full px-2 py-1 text-xs font-mono bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] placeholder-slate-400 dark:placeholder-[#62666d] rounded border border-slate-300 dark:border-white/[0.12] focus:ring-2 focus:ring-[#5e6ad2]"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Subject Total Row */}
              <tr className="bg-slate-100 dark:bg-[#141516] font-bold text-slate-900 dark:text-[#f7f8f8] border-t-2 border-slate-300 dark:border-white/[0.12]">
                <td colSpan={2} className="py-3 px-3 uppercase text-[11px] font-mono tracking-wider text-slate-500 dark:text-[#8a8f98]">
                  Subject Aggregate Total
                </td>
                <td className="py-3 px-3 text-center font-mono text-emerald-700 dark:text-[#27a644] text-sm tabular-nums">
                  {formatNumber(totalEasy)}
                </td>
                <td className="py-3 px-3 text-center font-mono text-amber-700 dark:text-[#f0bf00] text-sm tabular-nums">
                  {formatNumber(totalMedium)}
                </td>
                <td className="py-3 px-3 text-center font-mono text-rose-700 dark:text-[#eb5757] text-sm tabular-nums">
                  {formatNumber(totalHard)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-extrabold text-[#5e6ad2] dark:text-[#8b95f6] text-base tabular-nums">
                  {formatNumber(grandTotal)}
                </td>
                <td className="py-3 px-3 text-xs text-slate-500 dark:text-[#8a8f98] font-mono">
                  {topics.length} topics aggregate
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Change Reason and Confirmation */}
      <div className="bg-white dark:bg-[#0f1011] p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-800 dark:text-[#d0d3d8] uppercase tracking-wider">
              Mandatory Change Description <span className="text-[#eb5757]">*</span>
            </label>
            <span className="text-[11px] text-slate-400 dark:text-[#62666d]">Required for audit trail</span>
          </div>
          <textarea
            required
            rows={2}
            value={changeDescription}
            onChange={(e) => setChangeDescription(e.target.value)}
            placeholder="e.g. Updated question counts for Permutations and Percentage topics following Testpress monthly audit."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] placeholder-slate-400 dark:placeholder-[#62666d] focus:ring-2 focus:ring-[#5e6ad2]"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5e6ad2] hover:bg-[#6875e5] text-white font-semibold text-sm shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.35)] transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving Topic Inventories..." : "Save Topic Inventories"}
          </button>
        </div>
      </div>
    </form>
  );
}
