"use client";

import { useState } from "react";
import { saveExamCompositionAction, SectionInput } from "@/app/actions/examActions";
import { ReconciledTopic } from "@/app/actions/aiActions";
import AiBlueprintModal from "./AiBlueprintModal";
import {
  Plus,
  Trash2,
  Sparkles,
  Save,
  AlertCircle,
  CheckCircle2,
  Layers,
  ChevronDown,
  Info,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface MasterSubject {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
}

interface CompositionBuilderProps {
  examId: string;
  isCompletedExam: boolean;
  subjects: MasterSubject[];
  initialSections: {
    id: string;
    sectionName: string;
    subjectId: string;
    topics: {
      topicId: string;
      questionCount: number;
      level1Easy: number;
      level2Medium: number;
      level3Hard: number;
    }[];
  }[];
}

export default function CompositionBuilder({
  examId,
  isCompletedExam,
  subjects,
  initialSections,
}: CompositionBuilderProps) {
  const [sections, setSections] = useState<SectionInput[]>(() => {
    if (initialSections.length > 0) {
      return initialSections.map((s) => ({
        id: s.id,
        sectionName: s.sectionName,
        subjectId: s.subjectId,
        topics: s.topics.map((t) => ({
          topicId: t.topicId,
          questionCount: t.questionCount,
          level1Easy: t.level1Easy,
          level2Medium: t.level2Medium,
          level3Hard: t.level3Hard,
        })),
      }));
    }
    // Default initial empty section
    return [
      {
        id: "sec-init-1",
        sectionName: "Section 1",
        subjectId: subjects[0]?.id || "",
        topics: [],
      },
    ];
  });

  const [activeModalSectionId, setActiveModalSectionId] = useState<string | null>(null);
  const [changeDescription, setChangeDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Section management
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}`,
        sectionName: `Section ${prev.length + 1}`,
        subjectId: subjects[0]?.id || "",
        topics: [],
      },
    ]);
  };

  const removeSection = (sectionIndex: number) => {
    if (sections.length <= 1) {
      alert("An examination must contain at least one section.");
      return;
    }
    setSections((prev) => prev.filter((_, idx) => idx !== sectionIndex));
  };

  const updateSectionName = (sectionIndex: number, name: string) => {
    setSections((prev) =>
      prev.map((s, idx) => (idx === sectionIndex ? { ...s, sectionName: name } : s))
    );
  };

  const updateSectionSubject = (sectionIndex: number, subjectId: string) => {
    setSections((prev) =>
      prev.map((s, idx) =>
        idx === sectionIndex ? { ...s, subjectId, topics: [] } : s
      )
    );
  };

  // Topic management
  const addTopicRow = (sectionIndex: number) => {
    const sec = sections[sectionIndex];
    const availableTopics = subjects.find((s) => s.id === sec.subjectId)?.topics || [];
    const unusedTopic = availableTopics.find(
      (at) => !sec.topics.some((t) => t.topicId === at.id)
    );

    if (!unusedTopic) {
      alert("All active topics under this subject are already added to this section.");
      return;
    }

    setSections((prev) =>
      prev.map((s, idx) =>
        idx === sectionIndex
          ? {
              ...s,
              topics: [
                ...s.topics,
                {
                  topicId: unusedTopic.id,
                  questionCount: 4,
                  level1Easy: 2,
                  level2Medium: 1,
                  level3Hard: 1,
                },
              ],
            }
          : s
      )
    );
  };

  const removeTopicRow = (sectionIndex: number, topicIndex: number) => {
    setSections((prev) =>
      prev.map((s, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...s,
              topics: s.topics.filter((_, tIdx) => tIdx !== topicIndex),
            }
          : s
      )
    );
  };

  const updateTopicField = (
    sectionIndex: number,
    topicIndex: number,
    field: "topicId" | "questionCount" | "level1Easy" | "level2Medium" | "level3Hard",
    value: string | number
  ) => {
    setSections((prev) =>
      prev.map((s, sIdx) =>
        sIdx === sectionIndex
          ? {
              ...s,
              topics: s.topics.map((t, tIdx) => {
                if (tIdx !== topicIndex) return t;
                const updated = { ...t, [field]: value };
                // If questionCount was changed and doesn't match difficulty sum, keep user values
                return updated;
              }),
            }
          : s
      )
    );
  };

  // Apply AI Extracted Topics
  const handleApplyAiTopics = (sectionIndex: number, extracted: ReconciledTopic[]) => {
    setSections((prev) =>
      prev.map((s, idx) => {
        if (idx !== sectionIndex) return s;
        return {
          ...s,
          topics: extracted
            .filter((et) => et.matchedTopicId)
            .map((et) => ({
              topicId: et.matchedTopicId!,
              questionCount: et.questionCount,
              level1Easy: et.level1Easy,
              level2Medium: et.level2Medium,
              level3Hard: et.level3Hard,
            })),
        };
      })
    );
  };

  // Global calculations
  let examTotalQuestions = 0;
  let examTotalEasy = 0;
  let examTotalMedium = 0;
  let examTotalHard = 0;
  let examTotalTopics = 0;

  const validationErrors: string[] = [];

  sections.forEach((sec, sIdx) => {
    const secNumber = sIdx + 1;
    let secTotalQs = 0;

    sec.topics.forEach((t) => {
      secTotalQs += t.questionCount;
      examTotalEasy += t.level1Easy;
      examTotalMedium += t.level2Medium;
      examTotalHard += t.level3Hard;
      examTotalTopics++;

      const diffSum = t.level1Easy + t.level2Medium + t.level3Hard;
      if (diffSum !== t.questionCount) {
        const topicName =
          subjects
            .find((sub) => sub.id === sec.subjectId)
            ?.topics.find((mt) => mt.id === t.topicId)?.name || "Topic";
        validationErrors.push(
          `${sec.sectionName} > ${topicName}: Easy (${t.level1Easy}) + Medium (${t.level2Medium}) + Hard (${t.level3Hard}) = ${diffSum}, which does not match topic question count (${t.questionCount}).`
        );
      }
    });

    examTotalQuestions += secTotalQs;

    if (sec.topics.length === 0) {
      validationErrors.push(`Section "${sec.sectionName}" has no topics added.`);
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationErrors.length > 0) {
      setFeedback({ type: "error", text: "Please fix all validation errors before saving." });
      return;
    }

    if (!changeDescription.trim()) {
      setFeedback({
        type: "error",
        text: "A change description is mandatory before saving examination composition.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await saveExamCompositionAction({
        examId,
        sections,
        changeDescription,
      });

      setFeedback({
        type: "success",
        text: isCompletedExam
          ? "Composition updated! A new version was created and external platform update flags were triggered."
          : "Examination composition saved successfully!",
      });
      setChangeDescription("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({ type: "error", text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeSectionForModal = sections.find((s) => s.id === activeModalSectionId);
  const activeSubjectForModal = subjects.find((sub) => sub.id === activeSectionForModal?.subjectId);

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Validation Banner (PRD Section 11.8) */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-800 text-sm mb-1">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>Composition Validation Issues ({validationErrors.length})</span>
          </div>
          {validationErrors.map((err, idx) => (
            <div key={idx} className="pl-6 text-amber-800 font-medium">
              • {err}
            </div>
          ))}
        </div>
      )}

      {/* Overall Examination Summary (PRD Section 11.6) */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Sections
          </span>
          <span className="text-2xl font-bold text-white">{sections.length}</span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Topics
          </span>
          <span className="text-2xl font-bold text-white">{examTotalTopics}</span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Questions
          </span>
          <span className="text-2xl font-extrabold text-emerald-400">
            {formatNumber(examTotalQuestions)}
          </span>
        </div>

        <div className="sm:col-span-2 border-t sm:border-t-0 sm:border-l border-slate-700 sm:pl-4 pt-2 sm:pt-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Difficulty Distribution
          </span>
          <div className="flex items-center gap-3 mt-1 text-sm font-bold">
            <span className="text-emerald-400">Easy (I): {examTotalEasy}</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400">Med (II): {examTotalMedium}</span>
            <span className="text-slate-600">•</span>
            <span className="text-red-400">Hard (III): {examTotalHard}</span>
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.map((section, sIdx) => {
          const currentSubject = subjects.find((s) => s.id === section.subjectId);
          const availableTopics = currentSubject?.topics || [];
          const sectionTotalQs = section.topics.reduce((sum, t) => sum + t.questionCount, 0);

          return (
            <div
              key={section.id || sIdx}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Section Header */}
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-bold text-xs">
                    Section {sIdx + 1}
                  </span>
                  <input
                    type="text"
                    required
                    value={section.sectionName}
                    onChange={(e) => updateSectionName(sIdx, e.target.value)}
                    placeholder="Section Title (e.g. Arithmetic Core)"
                    className="font-bold text-slate-900 text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <select
                    value={section.subjectId}
                    onChange={(e) => updateSectionSubject(sIdx, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        Subject: {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalSectionId(section.id || `sec-${sIdx}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Upload Blueprint (AI)
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(sIdx)}
                    title="Remove Section"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Topics Table (PRD Section 11.4) */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 uppercase font-semibold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Topic (Filtered by Subject)</th>
                      <th className="py-2.5 px-4 text-right">Composition %</th>
                      <th className="py-2.5 px-4 text-right">Questions</th>
                      <th className="py-2.5 px-4 text-right">Level I (Easy)</th>
                      <th className="py-2.5 px-4 text-right">Level II (Medium)</th>
                      <th className="py-2.5 px-4 text-right">Level III (Hard)</th>
                      <th className="py-2.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {section.topics.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          No topics added yet. Click &quot;Add Topic&quot; below or &quot;Upload Blueprint (AI)&quot; above.
                        </td>
                      </tr>
                    ) : (
                      section.topics.map((t, tIdx) => {
                        const compPercentage =
                          sectionTotalQs > 0
                            ? ((t.questionCount / sectionTotalQs) * 100).toFixed(2)
                            : "0.00";

                        const diffMismatch =
                          t.level1Easy + t.level2Medium + t.level3Hard !== t.questionCount;

                        return (
                          <tr
                            key={tIdx}
                            className={diffMismatch ? "bg-red-50/50" : "hover:bg-slate-50"}
                          >
                            <td className="py-2.5 px-4">
                              <select
                                value={t.topicId}
                                onChange={(e) =>
                                  updateTopicField(sIdx, tIdx, "topicId", e.target.value)
                                }
                                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                              >
                                {availableTopics.map((mt) => (
                                  <option key={mt.id} value={mt.id}>
                                    {mt.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-600">
                              {compPercentage}%
                            </td>

                            <td className="py-2.5 px-4 text-right">
                              <input
                                type="number"
                                min="1"
                                required
                                value={t.questionCount}
                                onChange={(e) =>
                                  updateTopicField(
                                    sIdx,
                                    tIdx,
                                    "questionCount",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-16 px-2 py-1 text-right text-xs font-bold rounded border border-slate-300"
                              />
                            </td>

                            <td className="py-2.5 px-4 text-right">
                              <input
                                type="number"
                                min="0"
                                required
                                value={t.level1Easy}
                                onChange={(e) =>
                                  updateTopicField(
                                    sIdx,
                                    tIdx,
                                    "level1Easy",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-16 px-2 py-1 text-right text-xs text-emerald-700 font-semibold rounded border border-slate-300"
                              />
                            </td>

                            <td className="py-2.5 px-4 text-right">
                              <input
                                type="number"
                                min="0"
                                required
                                value={t.level2Medium}
                                onChange={(e) =>
                                  updateTopicField(
                                    sIdx,
                                    tIdx,
                                    "level2Medium",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-16 px-2 py-1 text-right text-xs text-amber-700 font-semibold rounded border border-slate-300"
                              />
                            </td>

                            <td className="py-2.5 px-4 text-right">
                              <input
                                type="number"
                                min="0"
                                required
                                value={t.level3Hard}
                                onChange={(e) =>
                                  updateTopicField(
                                    sIdx,
                                    tIdx,
                                    "level3Hard",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-16 px-2 py-1 text-right text-xs text-red-700 font-semibold rounded border border-slate-300"
                              />
                            </td>

                            <td className="py-2.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => removeTopicRow(sIdx, tIdx)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}

                    {/* Section Summary Row */}
                    <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                      <td className="py-2.5 px-4 uppercase text-[11px] text-slate-500">
                        Section Total ({section.topics.length} topics)
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono">100%</td>
                      <td className="py-2.5 px-4 text-right text-indigo-700 font-extrabold">
                        {sectionTotalQs}
                      </td>
                      <td className="py-2.5 px-4 text-right text-emerald-700 font-bold">
                        {section.topics.reduce((s, t) => s + t.level1Easy, 0)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-amber-700 font-bold">
                        {section.topics.reduce((s, t) => s + t.level2Medium, 0)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-red-700 font-bold">
                        {section.topics.reduce((s, t) => s + t.level3Hard, 0)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Add Topic Action in Section */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-start">
                <button
                  type="button"
                  onClick={() => addTopicRow(sIdx)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Topic Row
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Section Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={addSection}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition shadow-xs"
        >
          <Plus className="h-4 w-4" /> Add Another Section
        </button>
      </div>

      {/* Mandatory Change Reason & Save Footer */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Mandatory Change Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={2}
            value={changeDescription}
            onChange={(e) => setChangeDescription(e.target.value)}
            placeholder="e.g. Added Arithmetic Core section and 8 topics per examination blueprint."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || validationErrors.length > 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-xs disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving Composition..." : "Save Examination Composition"}
          </button>
        </div>
      </div>

      {/* AI Extraction Modal */}
      {activeModalSectionId && activeSectionForModal && activeSubjectForModal && (
        <AiBlueprintModal
          sectionId={activeModalSectionId}
          sectionName={activeSectionForModal.sectionName}
          subjectId={activeSubjectForModal.id}
          subjectName={activeSubjectForModal.name}
          onApplyExtractedTopics={(topics) => {
            const sIdx = sections.findIndex((s) => s.id === activeModalSectionId);
            if (sIdx !== -1) handleApplyAiTopics(sIdx, topics);
          }}
          onClose={() => setActiveModalSectionId(null)}
        />
      )}
    </form>
  );
}
