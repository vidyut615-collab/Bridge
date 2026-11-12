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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-[#19191b] rounded-xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between bg-[#f4f4f5] dark:bg-[#232325]">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950">
              <FileScan className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                Blueprint document extraction: {sectionName}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Subject: {subjectName} • OCR reconciliation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md transition-colors duration-150"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-2.5 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          {!hasExtracted ? (
            /* Upload step */
            <div className="space-y-4">
              <div className="border border-dashed border-black/[0.16] dark:border-white/[0.16] rounded-xl p-8 text-center bg-[#f4f4f5]/40 dark:bg-[#232325]/40 transition-colors duration-150">
                <UploadCloud className="h-8 w-8 text-zinc-400 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Upload blueprint image
                </p>
                <p className="text-[11px] text-zinc-500 mt-1 mb-3 font-mono">
                  PNG, JPG, or JPEG format
                </p>
                <label className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-white dark:bg-[#19191b] border border-black/[0.08] dark:border-white/[0.08] text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer transition-colors duration-150">
                  <ImageIcon className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                  Select image file
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {file && (
                  <p className="text-[11px] font-mono text-zinc-800 dark:text-zinc-200 mt-2.5">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {imagePreview && (
                <div className="p-3 bg-[#f4f4f5] dark:bg-[#232325] rounded-xl max-h-60 overflow-hidden flex items-center justify-center border border-black/[0.08] dark:border-white/[0.08]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Blueprint Preview"
                    className="max-h-52 rounded object-contain border border-black/[0.08] dark:border-white/[0.08]"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Review & Reconcile step */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#f4f4f5] dark:bg-[#232325] p-3 rounded-lg border border-black/[0.08] dark:border-white/[0.08]">
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-zinc-500">
                    Extracted topics: <span className="font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">{extractedTopics.length}</span>
                  </span>
                  <span>•</span>
                  <span className="text-zinc-500">
                    Total questions: <span className="font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">{totalExtractedQuestions}</span>
                  </span>
                </div>
                {unmatchedCount > 0 ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-[#19191b] text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3 text-red-500" strokeWidth={1.5} />
                    {unmatchedCount} unmatched {unmatchedCount === 1 ? "topic" : "topics"}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} />
                    All topics reconciled
                  </span>
                )}
              </div>

              <div className="border border-black/[0.08] dark:border-white/[0.08] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f4f4f5] dark:bg-[#232325] text-[11px] font-mono text-zinc-500 border-b border-black/[0.08] dark:border-white/[0.08]">
                    <tr>
                      <th className="py-2 px-3 font-normal">Extracted blueprint topic</th>
                      <th className="py-2 px-3 text-right font-normal">Target Qs</th>
                      <th className="py-2 px-3 text-right font-normal">I Easy</th>
                      <th className="py-2 px-3 text-right font-normal">II Med</th>
                      <th className="py-2 px-3 text-right font-normal">III Hard</th>
                      <th className="py-2 px-3 font-normal">Master topic mapping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                    {extractedTopics.map((top, idx) => (
                      <tr
                        key={idx}
                        className={
                          top.isUnmatched
                            ? "bg-red-500/10"
                            : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-150"
                        }
                      >
                        <td className="py-2.5 px-3 font-normal text-zinc-900 dark:text-zinc-100">
                          {top.extractedTopicName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                          {top.questionCount}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400 tabular-nums">{top.level1Easy}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400 tabular-nums">{top.level2Medium}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400 tabular-nums">{top.level3Hard}</td>
                        <td className="py-2.5 px-3">
                          {top.isUnmatched ? (
                            <div className="flex items-center gap-2">
                              <select
                                onChange={(e) => handleResolveTopic(idx, e.target.value)}
                                defaultValue=""
                                className="h-7 px-2 text-xs bg-white dark:bg-[#19191b] rounded-md border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 focus:outline-none"
                              >
                                <option value="" disabled>
                                  Select master topic
                                </option>
                                {masterTopics.map((m) => (
                                  <option key={m.id} value={m.id} className="dark:bg-[#19191b]">
                                    {m.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="font-normal text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
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
        <div className="px-5 py-3 border-t border-black/[0.08] dark:border-white/[0.08] bg-[#f4f4f5] dark:bg-[#232325] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-150"
          >
            Cancel
          </button>

          {!hasExtracted ? (
            <button
              type="button"
              disabled={!file || isProcessing}
              onClick={handleExtract}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-150 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)] disabled:opacity-50"
            >
              <FileScan className="h-4 w-4" strokeWidth={1.5} />
              {isProcessing ? "Processing document..." : "Scan and extract"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHasExtracted(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-150"
              >
                Re-upload
              </button>
              <button
                type="button"
                disabled={unmatchedCount > 0}
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-150 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)] disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                Apply to section
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
