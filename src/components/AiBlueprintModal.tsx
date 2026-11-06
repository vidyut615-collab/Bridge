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
        setError("Only image files (PNG, JPG, JPEG) are supported per PRD requirements.");
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
      <div className="w-full max-w-4xl bg-white dark:bg-[#0f1011] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.12] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50 dark:bg-[#141516]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#5e6ad2] text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">
                AI Blueprint Extraction: {sectionName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8a8f98]">
                Subject: <span className="font-semibold text-slate-800 dark:text-[#f7f8f8]">{subjectName}</span> • Powered by Groq Vision
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 dark:text-[#8a8f98] hover:text-slate-700 dark:hover:text-[#f7f8f8] hover:bg-slate-200 dark:hover:bg-white/[0.08] rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-[#eb5757] border border-rose-200 dark:border-rose-500/20 flex items-center gap-2.5 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-[#eb5757]" />
              <span>{error}</span>
            </div>
          )}

          {!hasExtracted ? (
            /* Upload step */
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-white/[0.12] rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-[#141516]/40 hover:bg-slate-50 dark:hover:bg-[#141516] transition">
                <UploadCloud className="h-10 w-10 text-[#5e6ad2] dark:text-[#8b95f6] mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-800 dark:text-[#f7f8f8]">
                  Upload Section Blueprint Image
                </p>
                <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-1 mb-4">
                  Supported formats: PNG, JPG, JPEG. (PDF & Excel outside initial scope).
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#191a1b] border border-slate-300 dark:border-white/[0.12] text-xs font-bold text-slate-700 dark:text-[#d0d3d8] hover:bg-slate-50 dark:hover:bg-white/[0.05] cursor-pointer shadow-xs transition">
                  <ImageIcon className="h-4 w-4 text-slate-500 dark:text-[#8a8f98]" />
                  Choose Image File
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {file && (
                  <p className="text-xs font-mono text-[#5e6ad2] dark:text-[#8b95f6] font-semibold mt-3">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {imagePreview && (
                <div className="p-4 bg-slate-100 dark:bg-[#141516] rounded-xl max-h-60 overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Blueprint Preview"
                    className="max-h-56 rounded-lg object-contain border border-slate-200 dark:border-white/[0.08] shadow-xs"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Review & Reconcile step (PRD Section 12.6 & 12.7) */
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-[#141516] p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-xs font-semibold text-slate-700 dark:text-[#d0d3d8]">
                    Extracted Topics: <span className="font-bold text-slate-900 dark:text-[#f7f8f8]">{extractedTopics.length}</span>
                  </span>
                  <span>•</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-[#d0d3d8]">
                    Total Questions: <span className="font-bold text-slate-900 dark:text-[#f7f8f8]">{totalExtractedQuestions}</span>
                  </span>
                </div>
                {unmatchedCount > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-amber-50 dark:bg-[#f0bf00]/15 text-amber-800 dark:text-[#f0bf00] border border-amber-200 dark:border-[#f0bf00]/25 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-[#f0bf00]" />
                    {unmatchedCount} Unmatched {unmatchedCount === 1 ? "Topic" : "Topics"}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/25 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#27a644]" />
                    All Topics Reconciled
                  </span>
                )}
              </div>

              <div className="border border-slate-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-[#141516] uppercase font-semibold text-slate-600 dark:text-[#8a8f98] border-b border-slate-200 dark:border-white/[0.08]">
                    <tr>
                      <th className="py-2.5 px-3">Extracted Topic in Blueprint</th>
                      <th className="py-2.5 px-3 text-right">Qs</th>
                      <th className="py-2.5 px-3 text-right">Easy</th>
                      <th className="py-2.5 px-3 text-right">Med</th>
                      <th className="py-2.5 px-3 text-right">Hard</th>
                      <th className="py-2.5 px-3">Master Topic Mapping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                    {extractedTopics.map((top, idx) => (
                      <tr
                        key={idx}
                        className={
                          top.isUnmatched
                            ? "bg-amber-50/50 dark:bg-[#f0bf00]/10"
                            : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                        }
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-[#d0d3d8]">
                          {top.extractedTopicName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900 dark:text-[#f7f8f8]">
                          {top.questionCount}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 dark:text-[#27a644]">{top.level1Easy}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-700 dark:text-[#f0bf00]">{top.level2Medium}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-700 dark:text-[#eb5757]">{top.level3Hard}</td>
                        <td className="py-2.5 px-3">
                          {top.isUnmatched ? (
                            <div className="flex items-center gap-2">
                              <select
                                onChange={(e) => handleResolveTopic(idx, e.target.value)}
                                defaultValue=""
                                className="px-2 py-1 text-xs bg-white dark:bg-[#141516] rounded-lg border border-amber-300 dark:border-[#f0bf00]/40 text-amber-900 dark:text-[#f0bf00] focus:ring-2 focus:ring-[#5e6ad2] font-semibold"
                              >
                                <option value="" disabled className="dark:bg-[#141516]">
                                  ⚠️ Select matching Master Topic...
                                </option>
                                {masterTopics.map((m) => (
                                  <option key={m.id} value={m.id} className="dark:bg-[#141516]">
                                    {m.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="font-semibold text-[#5e6ad2] dark:text-[#8b95f6] flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-[#27a644]" />
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
        <div className="p-4 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#141516] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-[#8a8f98] hover:bg-slate-200 dark:hover:bg-white/[0.08] rounded-lg transition"
          >
            Cancel
          </button>

          {!hasExtracted ? (
            <button
              type="button"
              disabled={!file || isProcessing}
              onClick={handleExtract}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5e6ad2] hover:bg-[#6875e5] text-white font-semibold text-xs shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.35)] transition disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {isProcessing ? "Extracting with Groq Vision..." : "Extract Section Blueprint"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHasExtracted(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-[#8a8f98] hover:bg-slate-200 dark:hover:bg-white/[0.08] rounded-lg transition"
              >
                Re-upload
              </button>
              <button
                type="button"
                disabled={unmatchedCount > 0}
                onClick={handleApply}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#27a644] hover:bg-emerald-600 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve & Apply to Section
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
