"use client";

import { useState } from "react";
import { saveExamCompositionAction, SectionInput } from "@/app/actions/examActions";
import { ReconciledTopic } from "@/app/actions/aiActions";
import AiBlueprintModal from "./AiBlueprintModal";
import {
  Plus,
  Trash2,
  FileScan,
  Save,
  AlertCircle,
  CheckCircle2,
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
      setFeedback({ type: "error", text: "An examination requires at least one section." });
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

  const addTopicRow = (sectionIndex: number) => {
    const sec = sections[sectionIndex];
    const availableTopics = subjects.find((s) => s.id === sec.subjectId)?.topics || [];
    const unusedTopic = availableTopics.find(
      (at) => !sec.topics.some((t) => t.topicId === at.id)
    );

    if (!unusedTopic) {
      setFeedback({ type: "error", text: "All active topics under this subject are already assigned to this section." });
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
                return { ...t, [field]: value };
              }),
            }
          : s
      )
    );
  };

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

  let examTotalQuestions = 0;
  let examTotalEasy = 0;
  let examTotalMedium = 0;
  let examTotalHard = 0;
  let examTotalTopics = 0;

  const validationErrors: string[] = [];

  sections.forEach((sec) => {
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
          `${sec.sectionName} > ${topicName}: Easy (${t.level1Easy}) + Medium (${t.level2Medium}) + Hard (${t.level3Hard}) = ${diffSum}, does not match topic target (${t.questionCount}).`
        );
      }
    });

    examTotalQuestions += secTotalQs;

    if (sec.topics.length === 0) {
      validationErrors.push(`Section "${sec.sectionName}" has no assigned topics.`);
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationErrors.length > 0) {
      setFeedback({ type: "error", text: "Resolve validation mismatches before committing." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await saveExamCompositionAction({
        examId,
        sections,
        changeDescription: changeDescription.trim() || undefined,
      });

      setFeedback({
        type: "success",
        text: "Composition successfully saved. History and version ledger updated.",
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
    <form onSubmit={handleSave} className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" strokeWidth={1.5} />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" strokeWidth={1.5} />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Validation Banner */}
      {validationErrors.length > 0 && (
        <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 space-y-2 text-sm">
          <div className="flex items-center gap-2.5 font-semibold text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 text-red-500" strokeWidth={1.5} />
            <span>Composition Validation Issues ({validationErrors.length})</span>
          </div>
          <div className="space-y-1 pl-7 font-mono text-xs text-red-600 dark:text-red-300">
            {validationErrors.map((err, idx) => (
              <div key={idx}>• {err}</div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Examination Summary */}
      <div className="craft-card p-6 grid grid-cols-2 sm:grid-cols-5 gap-6">
        <div>
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
            Sections
          </span>
          <span className="text-[32px] leading-tight font-bold font-mono text-[var(--text-primary)] mt-1.5 block tabular-nums">
            {sections.length}
          </span>
        </div>

        <div>
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
            Topic Units
          </span>
          <span className="text-[32px] leading-tight font-bold font-mono text-[var(--text-primary)] mt-1.5 block tabular-nums">
            {examTotalTopics}
          </span>
        </div>

        <div>
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
            Total Questions
          </span>
          <span className="text-[32px] leading-tight font-bold font-mono text-[var(--text-primary)] mt-1.5 block tabular-nums">
            {formatNumber(examTotalQuestions)}
          </span>
        </div>

        <div className="sm:col-span-2 border-t sm:border-t-0 sm:border-l border-[var(--border-hairline)] sm:pl-6 pt-4 sm:pt-0">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
            Difficulty Tier Distribution
          </span>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-mono">
            <span className="px-3 py-1 rounded-md font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Tier I Easy: {examTotalEasy}
            </span>
            <span className="px-3 py-1 rounded-md font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Tier II Med: {examTotalMedium}
            </span>
            <span className="px-3 py-1 rounded-md font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Tier III Hard: {examTotalHard}
            </span>
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
              className="craft-card overflow-hidden"
            >
              {/* Section Header */}
              <div className="px-6 py-4 bg-[var(--bg-raised)] border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-[var(--text-primary)] text-[var(--bg-card)] font-mono text-xs font-bold">
                    Section {sIdx + 1}
                  </span>
                  <input
                    type="text"
                    required
                    value={section.sectionName}
                    onChange={(e) => updateSectionName(sIdx, e.target.value)}
                    placeholder="Section name"
                    className="h-9 font-medium text-[var(--text-primary)] text-sm px-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-card)] focus:border-indigo-500 focus:outline-none"
                  />
                  <select
                    value={section.subjectId}
                    onChange={(e) => updateSectionSubject(sIdx, e.target.value)}
                    className="h-9 text-sm font-medium px-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id} className="dark:bg-[#11141c]">
                        Subject: {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveModalSectionId(section.id || `sec-${sIdx}`)}
                    className="craft-button-secondary inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium"
                  >
                    <FileScan className="h-4 w-4 text-indigo-500" strokeWidth={1.5} /> Extract from Blueprint
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(sIdx)}
                    title="Remove section"
                    className="h-9 w-9 inline-flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-150"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Topics Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-raised)]/70 text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
                    <tr>
                      <th className="py-3 px-4">Topic (Filtered by Subject)</th>
                      <th className="py-3 px-4 text-right">Weight %</th>
                      <th className="py-3 px-4 text-right">Target Qs</th>
                      <th className="py-3 px-4 text-right">Tier I Easy</th>
                      <th className="py-3 px-4 text-right">Tier II Med</th>
                      <th className="py-3 px-4 text-right">Tier III Hard</th>
                      <th className="py-3 px-4 text-center w-14">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {section.topics.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-sm text-[var(--text-muted)] font-mono">
                          No topics added yet. Click &quot;Add Topic Row&quot; or extract from document.
                        </td>
                      </tr>
                    ) : (
                      section.topics.map((t, tIdx) => {
                        const compPercentage =
                          sectionTotalQs > 0
                            ? ((t.questionCount / sectionTotalQs) * 100).toFixed(1)
                            : "0.0";

                        const diffMismatch =
                          t.level1Easy + t.level2Medium + t.level3Hard !== t.questionCount;

                        return (
                          <tr
                            key={tIdx}
                            className={
                              diffMismatch
                                ? "bg-red-500/10"
                                : "hover:bg-[var(--bg-raised)]/40 transition-colors"
                            }
                          >
                            <td className="py-3 px-4">
                              <select
                                value={t.topicId}
                                onChange={(e) =>
                                  updateTopicField(sIdx, tIdx, "topicId", e.target.value)
                                }
                                className="h-9 w-full px-3 text-sm font-medium rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                              >
                                {availableTopics.map((mt) => (
                                  <option key={mt.id} value={mt.id} className="dark:bg-[#11141c]">
                                    {mt.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-3 px-4 text-right font-mono text-sm text-[var(--text-secondary)] tabular-nums">
                              {compPercentage}%
                            </td>

                            <td className="py-3 px-4 text-right font-mono">
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
                                className="h-9 w-20 px-2 text-center text-sm font-bold rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none tabular-nums"
                              />
                            </td>

                            <td className="py-3 px-4 text-right font-mono">
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
                                className="h-9 w-20 px-2 text-center text-sm font-semibold rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 focus:border-emerald-500 focus:outline-none tabular-nums"
                              />
                            </td>

                            <td className="py-3 px-4 text-right font-mono">
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
                                className="h-9 w-20 px-2 text-center text-sm font-semibold rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 focus:border-amber-500 focus:outline-none tabular-nums"
                              />
                            </td>

                            <td className="py-3 px-4 text-right font-mono">
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
                                className="h-9 w-20 px-2 text-center text-sm font-semibold rounded-lg border border-indigo-500/30 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 focus:border-indigo-500 focus:outline-none tabular-nums"
                              />
                            </td>

                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => removeTopicRow(sIdx, tIdx)}
                                className="h-8 w-8 inline-flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}

                    {/* Section Summary Row */}
                    <tr className="bg-[var(--bg-raised)] font-semibold text-[var(--text-primary)] border-t border-[var(--border-hairline)]">
                      <td className="py-3 px-4 text-xs font-mono text-[var(--text-secondary)]">
                        Section Aggregate ({section.topics.length} topics)
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-[var(--text-secondary)]">100%</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm text-[var(--text-primary)] tabular-nums">
                        {sectionTotalQs}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                        {section.topics.reduce((s, t) => s + t.level1Easy, 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
                        {section.topics.reduce((s, t) => s + t.level2Medium, 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-indigo-600 dark:text-indigo-400 font-semibold tabular-nums">
                        {section.topics.reduce((s, t) => s + t.level3Hard, 0)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Add Topic Action in Section */}
              <div className="px-6 py-3.5 bg-[var(--bg-raised)]/40 border-t border-[var(--border-hairline)] flex justify-start">
                <button
                  type="button"
                  onClick={() => addTopicRow(sIdx)}
                  className="craft-button-secondary inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Add Topic Row
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Section Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={addSection}
          className="craft-card-subtle border border-dashed border-[var(--border-prominent)] hover:border-indigo-500 hover:bg-[var(--bg-raised)] text-[var(--text-primary)] text-sm font-semibold h-11 px-6 rounded-xl inline-flex items-center gap-2 transition-all duration-150"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Add Another Section
        </button>
      </div>

      {/* Save Action Bar (No compulsory prompt!) */}
      <div className="craft-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={changeDescription}
            onChange={(e) => setChangeDescription(e.target.value)}
            placeholder="Optional change note (e.g. Adjusted topic counts for Testpress)"
            className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || validationErrors.length > 0}
          className="craft-button-primary h-11 px-8 text-sm font-medium inline-flex items-center justify-center gap-2 shrink-0"
        >
          <Save className="h-4 w-4" strokeWidth={1.5} />
          {isSubmitting ? "Saving Composition..." : "Save Examination Composition"}
        </button>
      </div>

      {/* Blueprint Extraction Modal */}
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
