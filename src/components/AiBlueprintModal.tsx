"use client";

import { useState } from "react";
import { processBlueprintImageAction, ReconciledTopic } from "@/app/actions/aiActions";
import { FileScan, UploadCloud, AlertCircle, CheckCircle2, X, Image as ImageIcon } from "lucide-react";

interface AiBlueprintModalProps {
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  onApplyExtractedTopics: (topics: ReconciledTopic[]) => void;
  onClose: () => void;
}

export default function AiBlueprintModal({
  sectionId,
  sectionName,
  subjectId,
  subjectName,
  onApplyExtractedTopics,
  onClose,
}: AiBlueprintModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extracted data state
  const [extractedTopics, setExtractedTopics] = useState<ReconciledTopic[]>([]);
  const [masterTopics, setMasterTopics] = useState<{ id: string; name: string }[]>([]);
  const [hasExtracted, setHasExtracted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("image/")) {
        setError("Only image files (PNG, JPG, JPEG) are supported.");
        return;
      }
      setFile(selected);
      setError(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleExtract = async () => {
    if (!imagePreview) {
      setError("Select an image file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const base64Parts = imagePreview.split(",");
      const base64Data = base64Parts[1] || "";
      const mimeType = file?.type || "image/png";

      const result = await processBlueprintImageAction({
        sectionId,
        subjectId,
        base64Image: base64Data,
        mimeType,
      });

      setExtractedTopics(result.topics);
      setMasterTopics(result.availableMasterTopics);
      setHasExtracted(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveTopic = (index: number, chosenMasterId: string) => {
    const chosen = masterTopics.find((m) => m.id === chosenMasterId);
    if (!chosen) return;

    setExtractedTopics((prev) =>
      prev.map((t, idx) =>
        idx === index
          ? {
              ...t,
              matchedTopicId: chosen.id,
              matchedTopicName: chosen.name,
              isUnmatched: false,
            }
          : t
      )
    );
  };

  const handleApply = () => {
    const stillUnmatched = extractedTopics.some((t) => !t.matchedTopicId || t.isUnmatched);
    if (stillUnmatched) {
      setError("Map all unmatched topics to active master topics before applying.");
      return;
    }

    onApplyExtractedTopics(extractedTopics);
    onClose();
  };

  const totalExtractedQuestions = extractedTopics.reduce((s, t) => s + t.questionCount, 0);
  const unmatchedCount = extractedTopics.filter((t) => t.isUnmatched || !t.matchedTopicId).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl craft-card border border-[var(--border-hairline)] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border-hairline)] flex items-center justify-between bg-[var(--bg-raised)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <FileScan className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                AI Blueprint OCR Extraction: {sectionName}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                Target Subject: {subjectName} • Automatic Topic Reconciliation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] rounded-lg transition-colors duration-150"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-3 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          {!hasExtracted ? (
            /* Upload step */
            <div className="space-y-5">
              <div className="border border-dashed border-[var(--border-prominent)] rounded-xl p-10 text-center bg-[var(--bg-raised)]/40 hover:bg-[var(--bg-raised)]/60 transition-colors duration-150">
                <UploadCloud className="h-10 w-10 text-indigo-500 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Upload Curriculum Blueprint Snapshot
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4 font-mono">
                  High-resolution PNG, JPG, or JPEG specification document
                </p>
                <label className="craft-button-secondary inline-flex items-center gap-2 h-9 px-4 text-xs font-medium cursor-pointer">
                  <ImageIcon className="h-4 w-4 text-indigo-500" strokeWidth={1.5} />
                  Choose Blueprint File
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {file && (
                  <p className="text-xs font-mono font-medium text-[var(--text-primary)] mt-3">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {imagePreview && (
                <div className="p-4 bg-[var(--bg-raised)] rounded-xl max-h-64 overflow-hidden flex items-center justify-center border border-[var(--border-hairline)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Blueprint Preview"
                    className="max-h-56 rounded-lg object-contain border border-[var(--border-hairline)]"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Review & Reconcile step */
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-[var(--bg-raised)] p-4 rounded-xl border border-[var(--border-hairline)]">
                <div className="flex items-center gap-3 font-mono text-sm">
                  <span className="text-[var(--text-secondary)]">
                    Extracted Topics: <span className="font-bold text-[var(--text-primary)] tabular-nums">{extractedTopics.length}</span>
                  </span>
                  <span>•</span>
                  <span className="text-[var(--text-secondary)]">
                    Total Questions: <span className="font-bold text-[var(--text-primary)] tabular-nums">{totalExtractedQuestions}</span>
                  </span>
                </div>
                {unmatchedCount > 0 ? (
                  <span className="px-3 py-1 rounded-md text-xs font-mono font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" strokeWidth={1.5} />
                    {unmatchedCount} unmatched {unmatchedCount === 1 ? "topic" : "topics"}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.5} />
                    All Topics Reconciled
                  </span>
                )}
              </div>

              <div className="border border-[var(--border-hairline)] rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-raised)] text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
                    <tr>
                      <th className="py-3 px-4">Extracted Blueprint Topic</th>
                      <th className="py-3 px-4 text-right">Target Qs</th>
                      <th className="py-3 px-4 text-right">Tier I Easy</th>
                      <th className="py-3 px-4 text-right">Tier II Med</th>
                      <th className="py-3 px-4 text-right">Tier III Hard</th>
                      <th className="py-3 px-4">Master Topic Mapping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {extractedTopics.map((top, idx) => (
                      <tr
                        key={idx}
                        className={
                          top.isUnmatched
                            ? "bg-red-500/10"
                            : "hover:bg-[var(--bg-raised)]/40 transition-colors duration-150"
                        }
                      >
                        <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                          {top.extractedTopicName}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[var(--text-primary)] tabular-nums">
                          {top.questionCount}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">{top.level1Easy}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-amber-600 dark:text-amber-400 font-semibold tabular-nums">{top.level2Medium}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-indigo-600 dark:text-indigo-400 font-semibold tabular-nums">{top.level3Hard}</td>
                        <td className="py-3.5 px-4">
                          {top.isUnmatched ? (
                            <div className="flex items-center gap-2">
                              <select
                                onChange={(e) => handleResolveTopic(idx, e.target.value)}
                                defaultValue=""
                                className="h-8 px-2.5 text-xs bg-[var(--bg-card)] rounded-lg border border-[var(--border-hairline)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                              >
                                <option value="" disabled>
                                  Select master topic
                                </option>
                                {masterTopics.map((m) => (
                                  <option key={m.id} value={m.id} className="dark:bg-[#11141c]">
                                    {m.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                              {top.matchedTopicName}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-hairline)] bg-[var(--bg-raised)] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="craft-button-secondary h-9 px-4 text-xs font-medium"
          >
            Cancel
          </button>

          {!hasExtracted ? (
            <button
              type="button"
              disabled={!file || isProcessing}
              onClick={handleExtract}
              className="craft-button-primary h-9 px-5 text-xs font-medium inline-flex items-center gap-2"
            >
              <FileScan className="h-4 w-4" strokeWidth={1.5} />
              {isProcessing ? "Processing Blueprint..." : "Scan & Extract Blueprint"}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHasExtracted(false)}
                className="craft-button-secondary h-9 px-4 text-xs font-medium"
              >
                Re-upload
              </button>
              <button
                type="button"
                disabled={unmatchedCount > 0}
                onClick={handleApply}
                className="craft-button-primary h-9 px-5 text-xs font-medium inline-flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                Apply to Section
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
