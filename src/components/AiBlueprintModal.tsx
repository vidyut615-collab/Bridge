"use client";

import { useState } from "react";
import { processBlueprintImageAction, ReconciledTopic } from "@/app/actions/aiActions";
import { Sparkles, UploadCloud, AlertCircle, CheckCircle2, ArrowRight, X, Image as ImageIcon } from "lucide-react";

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
      // Extract base64 without prefix
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
    // Check if any topic is still unmatched
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Blueprint Extraction: {sectionName}
              </h3>
              <p className="text-xs text-slate-500">
                Subject: <span className="font-semibold text-slate-800">{subjectName}</span> • Powered by Groq Vision
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 flex items-center gap-2.5 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {!hasExtracted ? (
            /* Upload step */
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition">
                <UploadCloud className="h-10 w-10 text-indigo-500 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-800">
                  Upload Section Blueprint Image
                </p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Supported formats: PNG, JPG, JPEG. (PDF & Excel outside initial scope).
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition">
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                  Choose Image File
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {file && (
                  <p className="text-xs font-mono text-indigo-700 font-semibold mt-3">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {imagePreview && (
                <div className="p-4 bg-slate-100 rounded-xl max-h-60 overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Blueprint Preview"
                    className="max-h-56 rounded-lg object-contain border border-slate-200 shadow-xs"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Review & Reconcile step (PRD Section 12.6 & 12.7) */
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700">
                    Extracted Topics: <span className="font-bold text-slate-900">{extractedTopics.length}</span>
                  </span>
                  <span>•</span>
                  <span className="text-xs font-semibold text-slate-700">
                    Total Questions: <span className="font-bold text-slate-900">{totalExtractedQuestions}</span>
                  </span>
                </div>
                {unmatchedCount > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    {unmatchedCount} Unmatched {unmatchedCount === 1 ? "Topic" : "Topics"}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    All Topics Reconciled
                  </span>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 uppercase font-semibold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Extracted Topic in Blueprint</th>
                      <th className="py-2.5 px-3 text-right">Qs</th>
                      <th className="py-2.5 px-3 text-right">Easy</th>
                      <th className="py-2.5 px-3 text-right">Med</th>
                      <th className="py-2.5 px-3 text-right">Hard</th>
                      <th className="py-2.5 px-3">Master Topic Mapping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {extractedTopics.map((top, idx) => (
                      <tr
                        key={idx}
                        className={top.isUnmatched ? "bg-amber-50/50" : "hover:bg-slate-50"}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {top.extractedTopicName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {top.questionCount}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-700">{top.level1Easy}</td>
                        <td className="py-2.5 px-3 text-right text-amber-700">{top.level2Medium}</td>
                        <td className="py-2.5 px-3 text-right text-red-700">{top.level3Hard}</td>
                        <td className="py-2.5 px-3">
                          {top.isUnmatched ? (
                            <div className="flex items-center gap-2">
                              <select
                                onChange={(e) => handleResolveTopic(idx, e.target.value)}
                                defaultValue=""
                                className="px-2 py-1 text-xs bg-white rounded-lg border border-amber-300 text-amber-900 focus:ring-2 focus:ring-indigo-500 font-semibold"
                              >
                                <option value="" disabled>
                                  ⚠️ Select matching Master Topic...
                                </option>
                                {masterTopics.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="font-semibold text-indigo-700 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
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
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>

          {!hasExtracted ? (
            <button
              type="button"
              disabled={!file || isProcessing}
              onClick={handleExtract}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition shadow-xs disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {isProcessing ? "Extracting with Groq Vision..." : "Extract Section Blueprint"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHasExtracted(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Re-upload
              </button>
              <button
                type="button"
                disabled={unmatchedCount > 0}
                onClick={handleApply}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
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
