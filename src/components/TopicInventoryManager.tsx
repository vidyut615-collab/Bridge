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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 4 Rollup Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="craft-card p-5">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
            Configured topics
          </span>
          <span className="text-3xl font-semibold font-mono text-[var(--text-primary)] tabular-nums mt-3 block">
            {topics.length}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1.5 font-sans">units</span>
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-3 block font-mono">
            Active syllabus items
          </span>
        </div>

        <div className="craft-card p-5">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Tier I Easy
          </span>
          <span className="text-3xl font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-3 block">
            {formatNumber(totalEasy)}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-3 block font-mono">
            {grandTotal > 0 ? `${((totalEasy / grandTotal) * 100).toFixed(1)}%` : "0%"} of subject total
          </span>
        </div>

        <div className="craft-card p-5">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            Tier II Medium
          </span>
          <span className="text-3xl font-semibold font-mono text-amber-600 dark:text-amber-400 tabular-nums mt-3 block">
            {formatNumber(totalMedium)}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-3 block font-mono">
            {grandTotal > 0 ? `${((totalMedium / grandTotal) * 100).toFixed(1)}%` : "0%"} of subject total
          </span>
        </div>

        <div className="craft-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
              Tier III Hard
            </span>
            {totalDelta !== 0 && (
              <span className="inline-flex items-center text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {totalDelta > 0 ? `+${totalDelta}` : totalDelta} net
              </span>
            )}
          </div>
          <span className="text-3xl font-semibold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums mt-3 block">
            {formatNumber(totalHard)}
          </span>
          <span className="text-xs text-[var(--text-muted)] mt-3 block font-mono">
            {grandTotal > 0 ? `${((totalHard / grandTotal) * 100).toFixed(1)}%` : "0%"} of subject total
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
              : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/40"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.5} />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" strokeWidth={1.5} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Topics Matrix Table */}
      <div className="craft-card overflow-hidden">
        <div className="p-5 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              Topic units ({topics.length} items)
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Direct cell edit · Instant live aggregate calculation
            </p>
          </div>

          {/* Quick search input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic code or name..."
              className="h-9 w-full pl-9 pr-3 text-xs rounded-lg bg-[var(--bg-raised)] border border-[var(--border-hairline)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-raised)] text-xs font-mono text-[var(--text-muted)] border-b border-[var(--border-hairline)] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5 w-32 font-normal">Code</th>
                <th className="py-3 px-5 font-normal">Topic name</th>
                <th className="py-3 px-4 text-center w-32 font-normal">I Easy</th>
                <th className="py-3 px-4 text-center w-32 font-normal">II Med</th>
                <th className="py-3 px-4 text-center w-32 font-normal">III Hard</th>
                <th className="py-3 px-4 text-right w-32 font-semibold text-[var(--text-primary)]">Topic total</th>
                <th className="py-3 px-5 w-72 font-normal">Folder path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {filteredTopics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-[var(--text-muted)] font-mono">
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
                      className="hover:bg-[var(--bg-raised)] transition-colors duration-150"
                    >
                      <td className="py-3 px-5 font-mono text-xs text-[var(--text-muted)] font-medium">
                        {t.topicCode}
                      </td>

                      <td className="py-3 px-5 font-medium text-[var(--text-primary)]">
                        {t.name}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          required
                          value={t.easyCount}
                          onChange={(e) =>
                            handleFieldChange(t.id, "easyCount", parseInt(e.target.value) || 0)
                          }
                          className="h-8 w-24 px-2 text-center font-mono font-semibold text-sm text-[var(--text-primary)] bg-[var(--bg-raised)] rounded-lg border border-[var(--border-hairline)] focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </td>

                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          required
                          value={t.mediumCount}
                          onChange={(e) =>
                            handleFieldChange(t.id, "mediumCount", parseInt(e.target.value) || 0)
                          }
                          className="h-8 w-24 px-2 text-center font-mono font-semibold text-sm text-[var(--text-primary)] bg-[var(--bg-raised)] rounded-lg border border-[var(--border-hairline)] focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </td>

                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          required
                          value={t.hardCount}
                          onChange={(e) =>
                            handleFieldChange(t.id, "hardCount", parseInt(e.target.value) || 0)
                          }
                          className="h-8 w-24 px-2 text-center font-mono font-semibold text-sm text-[var(--text-primary)] bg-[var(--bg-raised)] rounded-lg border border-[var(--border-hairline)] focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-[var(--text-primary)] tabular-nums text-sm">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>{formatNumber(rowTotal)}</span>
                          {rowDelta !== 0 && (
                            <span className="text-xs text-[var(--text-muted)] font-normal font-mono">
                              ({rowDelta > 0 ? `+${rowDelta}` : rowDelta})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-[var(--text-muted)] shrink-0" strokeWidth={1.5} />
                          <input
                            type="text"
                            value={t.folderName}
                            onChange={(e) =>
                              handleFieldChange(t.id, "folderName", e.target.value)
                            }
                            placeholder="e.g. Quantitative/Aptitude/Arithmetic"
                            className="h-8 w-full px-2.5 text-xs font-mono bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-lg border border-[var(--border-hairline)] focus:outline-none transition-colors"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Subject Total Row */}
              <tr className="bg-[var(--bg-raised)] font-medium text-[var(--text-primary)] border-t border-[var(--border-strong)]">
                <td colSpan={2} className="py-3 px-5 text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                  Subject aggregate total
                </td>
                <td className="py-3 px-4 text-center font-mono text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatNumber(totalEasy)}
                </td>
                <td className="py-3 px-4 text-center font-mono text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {formatNumber(totalMedium)}
                </td>
                <td className="py-3 px-4 text-center font-mono text-sm font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                  {formatNumber(totalHard)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-sm tabular-nums text-[var(--text-primary)]">
                  {formatNumber(grandTotal)}
                </td>
                <td className="py-3 px-5 text-xs text-[var(--text-muted)] font-mono">
                  {topics.length} total active topics
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Change Reason and Submission Section */}
      <div className="craft-card p-6 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              Mandatory audit change justification <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-[var(--text-muted)] font-mono">Immutable audit trail requirement</span>
          </div>
          <textarea
            required
            rows={2}
            value={changeDescription}
            onChange={(e) => setChangeDescription(e.target.value)}
            placeholder="Document exact reason for inventory adjustments (e.g., Added 25 questions following Testpress syllabus audit)..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-150 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.15)] disabled:opacity-50"
          >
            <Save className="h-4 w-4" strokeWidth={1.5} />
            <span>{isSubmitting ? "Committing changes..." : "Commit inventory changes"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
