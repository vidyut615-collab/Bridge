"use client";

import { useState } from "react";
import { updateBatchTopicsInventoryAction } from "@/app/actions/questionBankActions";
import { formatNumber } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Save, Folder, Search } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredTopics = topics.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.topicCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.folderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* 4 Rollup KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-500 block">
            Active Topics
          </span>
          <span className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 tabular-nums mt-1 block">
            {topics.length}
          </span>
          <span className="text-[11px] text-zinc-400 mt-1 block">Configured Units</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-500 block">
            Easy (Level I)
          </span>
          <span className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 tabular-nums mt-1 block">
            {formatNumber(totalEasy)}
          </span>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            {grandTotal > 0 ? `${((totalEasy / grandTotal) * 100).toFixed(1)}%` : "0%"} of subject
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-500 block">
            Medium (Level II)
          </span>
          <span className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 tabular-nums mt-1 block">
            {formatNumber(totalMedium)}
          </span>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            {grandTotal > 0 ? `${((totalMedium / grandTotal) * 100).toFixed(1)}%` : "0%"} of subject
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-500 block">
              Hard (Level III)
            </span>
            {totalDelta !== 0 && (
              <span className="inline-flex items-center text-[11px] font-mono font-medium px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                {totalDelta > 0 ? `+${totalDelta}` : totalDelta}
              </span>
            )}
          </div>
          <span className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 tabular-nums mt-1 block">
            {formatNumber(totalHard)}
          </span>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            {grandTotal > 0 ? `${((totalHard / grandTotal) * 100).toFixed(1)}%` : "0%"} of subject
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-lg flex items-center gap-2.5 text-xs ${
            message.type === "success"
              ? "bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800"
              : "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Topics Interactive Matrix Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Topics Inventory Register ({topics.length} Topics)
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Edit values in-place • Row & subject totals calculate instantly
            </p>
          </div>

          {/* Quick search input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter topics..."
              className="h-9 w-full pl-8 pr-3 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-300 focus:bg-white dark:focus:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-mono uppercase tracking-wider text-zinc-500 border-b border-zinc-200/80 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-4 w-28 font-medium">Topic Code</th>
                <th className="py-2.5 px-4 font-medium">Topic Name</th>
                <th className="py-2.5 px-4 text-center w-28 font-medium">Easy (I)</th>
                <th className="py-2.5 px-4 text-center w-28 font-medium">Medium (II)</th>
                <th className="py-2.5 px-4 text-center w-28 font-medium">Hard (III)</th>
                <th className="py-2.5 px-4 text-right w-28 font-semibold text-zinc-950 dark:text-zinc-50">Topic Total</th>
                <th className="py-2.5 px-4 w-64 font-medium">Folder Name on Testpress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredTopics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-zinc-500">
                    No topics matched your search filter &quot;{searchQuery}&quot;.
                  </td>
                </tr>
              ) : (
                filteredTopics.map((t) => {
                  const rowTotal =
                    (Number(t.easyCount) || 0) +
                    (Number(t.mediumCount) || 0) +
                    (Number(t.hardCount) || 0);

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                        {t.topicCode}
                      </td>

                      <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {t.name}
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <input
                          type="number"
                          min="0"
                          required
                          value={t.easyCount}
                          onChange={(e) =>
                            handleFieldChange(t.id, "easyCount", parseInt(e.target.value) || 0)
                          }
                          className="h-8 w-20 px-2 py-1 text-center font-mono font-medium text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/60 rounded-md border border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-300 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none transition-colors"
                        />
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <input
                          type="number"
                          min="0"
                          required
                          value={t.mediumCount}
                          onChange={(e) =>
                            handleFieldChange(t.id, "mediumCount", parseInt(e.target.value) || 0)
                          }
                          className="h-8 w-20 px-2 py-1 text-center font-mono font-medium text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/60 rounded-md border border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-300 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none transition-colors"
                        />
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <input
                          type="number"
                          min="0"
                          required
                          value={t.hardCount}
                          onChange={(e) =>
                            handleFieldChange(t.id, "hardCount", parseInt(e.target.value) || 0)
                          }
                          className="h-8 w-20 px-2 py-1 text-center font-mono font-medium text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/60 rounded-md border border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-300 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none transition-colors"
                        />
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-zinc-950 dark:text-zinc-50 tabular-nums text-xs">
                        {formatNumber(rowTotal)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Folder className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <input
                            type="text"
                            value={t.folderName}
                            onChange={(e) =>
                              handleFieldChange(t.id, "folderName", e.target.value)
                            }
                            placeholder="e.g. Topic_Folder_Path"
                            className="h-8 w-full px-2.5 py-1 text-xs font-mono bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-md border border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-300 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none transition-colors"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Subject Total Row */}
              <tr className="bg-zinc-50/70 dark:bg-zinc-800/40 font-semibold text-zinc-950 dark:text-zinc-50 border-t border-zinc-200/80 dark:border-zinc-800">
                <td colSpan={2} className="py-3 px-4 uppercase text-[11px] font-mono tracking-wider text-zinc-500">
                  Subject Aggregate Total
                </td>
                <td className="py-3 px-4 text-center font-mono text-xs tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatNumber(totalEasy)}
                </td>
                <td className="py-3 px-4 text-center font-mono text-xs tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatNumber(totalMedium)}
                </td>
                <td className="py-3 px-4 text-center font-mono text-xs tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatNumber(totalHard)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-xs tabular-nums text-zinc-950 dark:text-zinc-50">
                  {formatNumber(grandTotal)}
                </td>
                <td className="py-3 px-4 text-xs text-zinc-500 font-mono">
                  {topics.length} topics total
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Change Reason and Confirmation */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider">
              Mandatory Change Description <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-zinc-400">Required for audit trail</span>
          </div>
          <textarea
            required
            rows={2}
            value={changeDescription}
            onChange={(e) => setChangeDescription(e.target.value)}
            placeholder="e.g. Updated question counts for Permutations and Percentage topics following Testpress monthly audit."
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 focus:border-zinc-900 dark:focus:border-zinc-300 focus:bg-white dark:focus:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {isSubmitting ? "Saving Topic Inventories..." : "Save Topic Inventories"}
          </button>
        </div>
      </div>
    </form>
  );
}
