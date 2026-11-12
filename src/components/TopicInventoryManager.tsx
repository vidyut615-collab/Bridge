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

  // Map initial totals for inline delta tracking
  const initialMap = new Map(
    initialTopics.map((t) => [
      t.id,
      (Number(t.easyCount) || 0) + (Number(t.mediumCount) || 0) + (Number(t.hardCount) || 0),
    ])
  );

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
        text: "A mandatory change description is required for the system audit trail.",
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
        text: `Topic inventory updated for ${subjectName}. Subject aggregate recalculated.`,
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
      {/* 4 Rollup Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#19191b] border border-black/[0.08] dark:border-white/[0.08]">
          <span className="text-xs text-zinc-500 block font-normal">
            Topics configured
          </span>
          <span className="text-[28px] leading-none font-medium font-mono text-zinc-900 dark:text-zinc-100 tabular-nums mt-2 block">
            {topics.length}
          </span>
          <span className="text-xs text-zinc-500 mt-2 block font-mono">
            Active syllabus items
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#19191b] border border-black/[0.08] dark:border-white/[0.08]">
          <span className="text-xs text-zinc-500 block font-normal">
            Tier I Easy
          </span>
          <span className="text-[28px] leading-none font-medium font-mono text-zinc-900 dark:text-zinc-100 tabular-nums mt-2 block">
            {formatNumber(totalEasy)}
          </span>
          <span className="text-xs text-zinc-500 mt-2 block font-mono">
            {grandTotal > 0 ? `${((totalEasy / grandTotal) * 100).toFixed(1)}%` : "0%"} of subject
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#19191b] border border-black/[0.08] dark:border-white/[0.08]">
          <span className="text-xs text-zinc-500 block font-normal">
            Tier II Medium
          </span>
          <span className="text-[28px] leading-none font-medium font-mono text-zinc-900 dark:text-zinc-100 tabular-nums mt-2 block">
            {formatNumber(totalMedium)}
          </span>
          <span className="text-xs text-zinc-500 mt-2 block font-mono">
            {grandTotal > 0 ? `${((totalMedium / grandTotal) * 100).toFixed(1)}%` : "0%"} of subject
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#19191b] border border-black/[0.08] dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 block font-normal">
              Tier III Hard
            </span>
            {totalDelta !== 0 && (
              <span className="inline-flex items-center text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#f4f4f5] dark:bg-[#232325] text-zinc-900 dark:text-zinc-100 border border-black/[0.08] dark:border-white/[0.08]">
                {totalDelta > 0 ? `+${totalDelta}` : totalDelta} net
              </span>
            )}
          </div>
          <span className="text-[28px] leading-none font-medium font-mono text-zinc-900 dark:text-zinc-100 tabular-nums mt-2 block">
            {formatNumber(totalHard)}
          </span>
          <span className="text-xs text-zinc-500 mt-2 block font-mono">
            {grandTotal > 0 ? `${((totalHard / grandTotal) * 100).toFixed(1)}%` : "0%"} of subject
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-lg flex items-center gap-2.5 text-xs ${
            message.type === "success"
              ? "bg-[#f4f4f5] dark:bg-[#232325] text-zinc-900 dark:text-zinc-100 border border-black/[0.08] dark:border-white/[0.08]"
              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.5} />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" strokeWidth={1.5} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Topics Matrix Table */}
      <div className="bg-white dark:bg-[#19191b] rounded-xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden">
        <div className="p-4 border-b border-black/[0.08] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              Topic units ({topics.length} items)
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
              Direct cell edit • Recalculates dynamically
            </p>
          </div>

          {/* Quick search input */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics"
              className="h-8 w-full pl-8 pr-3 text-xs rounded-md bg-[#f4f4f5] dark:bg-[#232325] border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors duration-150"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f4f5] dark:bg-[#232325] text-[11px] font-mono text-zinc-500 border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-2.5 px-4 w-28 font-normal">Code</th>
                <th className="py-2.5 px-4 font-normal">Topic name</th>
                <th className="py-2.5 px-4 text-center w-28 font-normal">I Easy</th>
                <th className="py-2.5 px-4 text-center w-28 font-normal">II Med</th>
                <th className="py-2.5 px-4 text-center w-28 font-normal">III Hard</th>
                <th className="py-2.5 px-4 text-right w-28 font-medium text-zinc-900 dark:text-zinc-100">Topic total</th>
                <th className="py-2.5 px-4 w-60 font-normal">Folder path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {filteredTopics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-zinc-500 font-mono">
                    No topics matched query &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filteredTopics.map((t) => {
                  const rowTotal =
                    (Number(t.easyCount) || 0) +
                    (Number(t.mediumCount) || 0) +
                    (Number(t.hardCount) || 0);

                  const initialRowTotal = initialMap.get(t.id) ?? rowTotal;
                  const rowDelta = rowTotal - initialRowTotal;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-150"
                    >
                      <td className="py-2.5 px-4 font-mono text-[11px] text-zinc-500">
                        {t.topicCode}
                      </td>

                      <td className="py-2.5 px-4 font-normal text-zinc-900 dark:text-zinc-100">
                        {t.name}
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          required
                          value={t.easyCount}
                          onChange={(e) =>
                            handleFieldChange(t.id, "easyCount", parseInt(e.target.value) || 0)
                          }
                          className="h-7 w-20 px-2 py-0.5 text-center font-mono font-medium text-xs text-zinc-900 dark:text-zinc-100 bg-[#f4f4f5] dark:bg-[#232325] rounded border border-black/[0.08] dark:border-white/[0.08] focus:outline-none transition-colors duration-150"
                        />
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          required
                          value={t.mediumCount}
                          onChange={(e) =>
                            handleFieldChange(t.id, "mediumCount", parseInt(e.target.value) || 0)
                          }
                          className="h-7 w-20 px-2 py-0.5 text-center font-mono font-medium text-xs text-zinc-900 dark:text-zinc-100 bg-[#f4f4f5] dark:bg-[#232325] rounded border border-black/[0.08] dark:border-white/[0.08] focus:outline-none transition-colors duration-150"
                        />
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          required
                          value={t.hardCount}
                          onChange={(e) =>
                            handleFieldChange(t.id, "hardCount", parseInt(e.target.value) || 0)
                          }
                          className="h-7 w-20 px-2 py-0.5 text-center font-mono font-medium text-xs text-zinc-900 dark:text-zinc-100 bg-[#f4f4f5] dark:bg-[#232325] rounded border border-black/[0.08] dark:border-white/[0.08] focus:outline-none transition-colors duration-150"
                        />
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono font-medium text-zinc-900 dark:text-zinc-100 tabular-nums text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>{formatNumber(rowTotal)}</span>
                          {rowDelta !== 0 && (
                            <span className="text-[10px] text-zinc-400">
                              ({rowDelta > 0 ? `+${rowDelta}` : rowDelta})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Folder className="h-3.5 w-3.5 text-zinc-400 shrink-0" strokeWidth={1.5} />
                          <input
                            type="text"
                            value={t.folderName}
                            onChange={(e) =>
                              handleFieldChange(t.id, "folderName", e.target.value)
                            }
                            placeholder="Folder path"
                            className="h-7 w-full px-2 py-0.5 text-xs font-mono bg-[#f4f4f5] dark:bg-[#232325] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded border border-black/[0.08] dark:border-white/[0.08] focus:outline-none transition-colors duration-150"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Subject Total Row */}
              <tr className="bg-[#f4f4f5] dark:bg-[#232325] font-medium text-zinc-900 dark:text-zinc-100 border-t border-black/[0.08] dark:border-white/[0.08]">
                <td colSpan={2} className="py-2.5 px-4 text-[11px] font-mono text-zinc-500">
                  Subject aggregate total
                </td>
                <td className="py-2.5 px-4 text-center font-mono text-xs tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatNumber(totalEasy)}
                </td>
                <td className="py-2.5 px-4 text-center font-mono text-xs tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatNumber(totalMedium)}
                </td>
                <td className="py-2.5 px-4 text-center font-mono text-xs tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatNumber(totalHard)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-semibold text-xs tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatNumber(grandTotal)}
                </td>
                <td className="py-2.5 px-4 text-xs text-zinc-500 font-mono">
                  {topics.length} topics aggregate
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Change Reason and Submission Ledger */}
      <div className="bg-white dark:bg-[#19191b] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-zinc-900 dark:text-zinc-100">
              Mandatory change description <span className="text-zinc-400">*</span>
            </label>
            <span className="text-[11px] text-zinc-400 font-mono">System audit log requirement</span>
          </div>
          <textarea
            required
            rows={2}
            value={changeDescription}
            onChange={(e) => setChangeDescription(e.target.value)}
            placeholder="Document reason for delta changes (e.g. Added 15 questions to Permutation following Testpress audit)"
            className="w-full px-3 py-2 text-xs rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-[#f4f4f5] dark:bg-[#232325] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors duration-150"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-150 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)] disabled:opacity-50"
          >
            <Save className="h-4 w-4" strokeWidth={1.5} />
            {isSubmitting ? "Committing..." : "Commit inventory changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
