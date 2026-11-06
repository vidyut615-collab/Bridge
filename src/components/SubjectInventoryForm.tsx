"use client";

import { useState } from "react";
import { updateSubjectInventoryAction } from "@/app/actions/questionBankActions";
import { formatNumber } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Save } from "lucide-react";

interface SubjectInventoryFormProps {
  subjectId: string;
  initialEasy: number;
  initialMedium: number;
  initialHard: number;
  initialEasyFolder: string;
  initialMediumFolder: string;
  initialHardFolder: string;
}

export default function SubjectInventoryForm({
  subjectId,
  initialEasy,
  initialMedium,
  initialHard,
  initialEasyFolder,
  initialMediumFolder,
  initialHardFolder,
}: SubjectInventoryFormProps) {
  const [easy, setEasy] = useState(initialEasy);
  const [medium, setMedium] = useState(initialMedium);
  const [hard, setHard] = useState(initialHard);

  const [easyFolder, setEasyFolder] = useState(initialEasyFolder);
  const [mediumFolder, setMediumFolder] = useState(initialMediumFolder);
  const [hardFolder, setHardFolder] = useState(initialHardFolder);

  const [changeDescription, setChangeDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Live Automatic Total calculation (PRD Section 5.5)
  const currentTotal = (Number(easy) || 0) + (Number(medium) || 0) + (Number(hard) || 0);
  const initialTotal = initialEasy + initialMedium + initialHard;
  const totalDelta = currentTotal - initialTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeDescription.trim()) {
      setMessage({ type: "error", text: "Change description is mandatory before saving an inventory update." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateSubjectInventoryAction({
        subjectId,
        easyCount: Number(easy) || 0,
        mediumCount: Number(medium) || 0,
        hardCount: Number(hard) || 0,
        easyFolder,
        mediumFolder,
        hardFolder,
        changeDescription,
      });

      setMessage({ type: "success", text: "Question bank inventory updated successfully!" });
      setChangeDescription("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0f1011] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">Direct Inventory Update</h2>
          <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-0.5">
            Enter the latest confirmed question counts and folder names from Testpress.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-500 dark:text-[#8a8f98] uppercase tracking-wider block">
            Calculated Total
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-[#f7f8f8] font-mono">{formatNumber(currentTotal)}</span>
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

      {/* 3 Difficulty Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level I - Easy */}
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/[0.04] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-[#27a644]">
              Level I • Easy
            </span>
            <span className="text-xs text-slate-400 dark:text-[#62666d] font-mono">Previous: {initialEasy}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
              Question Count
            </label>
            <input
              type="number"
              min="0"
              required
              value={easy}
              onChange={(e) => setEasy(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] rounded-lg border border-slate-300 dark:border-white/[0.12] focus:ring-2 focus:ring-[#27a644]/20 focus:border-[#27a644] font-semibold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
              Folder Name
            </label>
            <input
              type="text"
              value={easyFolder}
              onChange={(e) => setEasyFolder(e.target.value)}
              placeholder="e.g. Subject_Easy_Bank"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] placeholder-slate-400 dark:placeholder-[#62666d] rounded-lg border border-slate-300 dark:border-white/[0.12] focus:ring-2 focus:ring-[#27a644]/20 focus:border-[#27a644] font-mono"
            />
          </div>
        </div>

        {/* Level II - Medium */}
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/30 dark:bg-amber-500/[0.04] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-[#f0bf00]">
              Level II • Medium
            </span>
            <span className="text-xs text-slate-400 dark:text-[#62666d] font-mono">Previous: {initialMedium}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
              Question Count
            </label>
            <input
              type="number"
              min="0"
              required
              value={medium}
              onChange={(e) => setMedium(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] rounded-lg border border-slate-300 dark:border-white/[0.12] focus:ring-2 focus:ring-[#f0bf00]/20 focus:border-[#f0bf00] font-semibold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
              Folder Name
            </label>
            <input
              type="text"
              value={mediumFolder}
              onChange={(e) => setMediumFolder(e.target.value)}
              placeholder="e.g. Subject_Medium_Bank"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] placeholder-slate-400 dark:placeholder-[#62666d] rounded-lg border border-slate-300 dark:border-white/[0.12] focus:ring-2 focus:ring-[#f0bf00]/20 focus:border-[#f0bf00] font-mono"
            />
          </div>
        </div>

        {/* Level III - Hard */}
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/30 dark:bg-rose-500/[0.04] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-[#eb5757]">
              Level III • Hard
            </span>
            <span className="text-xs text-slate-400 dark:text-[#62666d] font-mono">Previous: {initialHard}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
              Question Count
            </label>
            <input
              type="number"
              min="0"
              required
              value={hard}
              onChange={(e) => setHard(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] rounded-lg border border-slate-300 dark:border-white/[0.12] focus:ring-2 focus:ring-[#eb5757]/20 focus:border-[#eb5757] font-semibold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
              Folder Name
            </label>
            <input
              type="text"
              value={hardFolder}
              onChange={(e) => setHardFolder(e.target.value)}
              placeholder="e.g. Subject_Hard_Bank"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] placeholder-slate-400 dark:placeholder-[#62666d] rounded-lg border border-slate-300 dark:border-white/[0.12] focus:ring-2 focus:ring-[#eb5757]/20 focus:border-[#eb5757] font-mono"
            />
          </div>
        </div>
      </div>

      {/* Mandatory Change Description (PRD Section 5.8 & 16.3) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800 dark:text-[#d0d3d8] uppercase tracking-wider">
            Mandatory Change Description <span className="text-[#eb5757]">*</span>
          </label>
          <span className="text-[11px] text-slate-400 dark:text-[#62666d]">Required for audit tracking</span>
        </div>
        <textarea
          required
          rows={2}
          value={changeDescription}
          onChange={(e) => setChangeDescription(e.target.value)}
          placeholder="e.g. Added 20 Easy and 10 Medium questions after college curriculum review."
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] placeholder-slate-400 dark:placeholder-[#62666d] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/20 focus:border-[#5e6ad2]"
        />
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-white/[0.08]">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5e6ad2] hover:bg-[#6875e5] text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#5e6ad2] focus:ring-offset-2 transition shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.35)] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Updating Inventory..." : "Confirm & Save Inventory"}
        </button>
      </div>
    </form>
  );
}
