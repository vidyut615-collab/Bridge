"use client";

import { useState } from "react";
import { processBlueprintImageAction, ReconciledTopic } from "@/app/actions/aiActions";
import { Sparkles, UploadCloud, AlertCircle, CheckCircle2, X, Image as ImageIcon } from "lucide-react";

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
      setError("Please select an image file first.");
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
      setError("Please map all unmatched topics to active master topics before applying.");
      return;
    }

    onApplyExtractedTopics(extractedTopics);
    onClose();
  };

  const totalExtractedQuestions = extractedTopics.reduce((s, t) => s + t.questionCount, 0);
  const unmatchedCount = extractedTopics.filter((t) => t.isUnmatched || !t.matchedTopicId).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                AI Blueprint Extraction: {sectionName}
              </h3>
              <p className="text-xs text-zinc-500">
                Subject: <span className="font-medium text-zinc-900 dark:text-zinc-100">{subjectName}</span> • Automated Vision OCR Reconciliation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 flex items-center gap-2.5 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {!hasExtracted ? (
            /* Upload step */
            <div className="space-y-4">
              <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center bg-zinc-50/50 dark:bg-zinc-800/20 transition">
                <UploadCloud className="h-9 w-9 text-zinc-400 mx-auto mb-2.5" />
                <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  Upload Section Blueprint Image
                </p>
                <p className="text-xs text-zinc-500 mt-1 mb-4">
                  Supported formats: PNG, JPG, JPEG. Clean screenshot or scanned syllabus.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 cursor-pointer transition shadow-2xs">
                  <ImageIcon className="h-3.5 w-3.5 text-zinc-400" />
                  Choose Image File
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {file && (
                  <p className="text-xs font-mono text-zinc-900 dark:text-zinc-100 font-medium mt-3">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {imagePreview && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl max-h-60 overflow-hidden flex items-center justify-center border border-zinc-200/80 dark:border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Blueprint Preview"
                    className="max-h-52 rounded-lg object-contain border border-zinc-200 dark:border-zinc-700"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Review & Reconcile step */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-700">
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-zinc-500">
                    Extracted Topics: <span className="font-semibold text-zinc-950 dark:text-zinc-50">{extractedTopics.length}</span>
                  </span>
                  <span>•</span>
                  <span className="text-zinc-500">
                    Total Questions: <span className="font-semibold text-zinc-950 dark:text-zinc-50">{totalExtractedQuestions}</span>
                  </span>
                </div>
                {unmatchedCount > 0 ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    {unmatchedCount} Unmatched {unmatchedCount === 1 ? "Topic" : "Topics"}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    All Topics Reconciled
                  </span>
                )}
              </div>

              <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 uppercase font-mono tracking-wider text-[11px] text-zinc-500 border-b border-zinc-200/80 dark:border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">Extracted Topic in Blueprint</th>
                      <th className="py-2.5 px-3 text-right font-medium">Qs</th>
                      <th className="py-2.5 px-3 text-right font-medium">Easy</th>
                      <th className="py-2.5 px-3 text-right font-medium">Med</th>
                      <th className="py-2.5 px-3 text-right font-medium">Hard</th>
                      <th className="py-2.5 px-3 font-medium">Master Topic Mapping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {extractedTopics.map((top, idx) => (
                      <tr
                        key={idx}
                        className={
                          top.isUnmatched
                            ? "bg-red-50/30 dark:bg-red-950/20"
                            : "hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                        }
                      >
                        <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                          {top.extractedTopicName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-zinc-950 dark:text-zinc-50">
                          {top.questionCount}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400">{top.level1Easy}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400">{top.level2Medium}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400">{top.level3Hard}</td>
                        <td className="py-2.5 px-3">
                          {top.isUnmatched ? (
                            <div className="flex items-center gap-2">
                              <select
                                onChange={(e) => handleResolveTopic(idx, e.target.value)}
                                defaultValue=""
                                className="h-8 px-2 text-xs bg-white dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                              >
                                <option value="" disabled>
                                  Select matching Master Topic...
                                </option>
                                {masterTopics.map((m) => (
                                  <option key={m.id} value={m.id} className="dark:bg-zinc-900">
                                    {m.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
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
        <div className="px-5 py-3 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 rounded-md transition-colors"
          >
            Cancel
          </button>

          {!hasExtracted ? (
            <button
              type="button"
              disabled={!file || isProcessing}
              onClick={handleExtract}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isProcessing ? "Extracting with Groq Vision..." : "Extract Section Blueprint"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHasExtracted(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 rounded-md transition-colors"
              >
                Re-upload
              </button>
              <button
                type="button"
                disabled={unmatchedCount > 0}
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve & Apply to Section
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
