"use client";

import { useState } from "react";
import {
  createCollegeAction,
  toggleArchiveCollegeAction,
  createSubjectAction,
  renameSubjectAction,
  toggleArchiveSubjectAction,
  createTopicAction,
  renameTopicAction,
  toggleArchiveTopicAction,
  createUserAction,
} from "@/app/actions/masterDataActions";
import {
  Building2,
  BookOpen,
  ListTree,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

interface CollegeItem {
  id: string;
  name: string;
  code: string;
  isArchived: boolean;
}

interface SubjectItem {
  id: string;
  name: string;
  isArchived: boolean;
  topicCount: number;
}

interface TopicItem {
  id: string;
  topicCode: string;
  name: string;
  subjectId: string;
  isArchived: boolean;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MasterDataProps {
  colleges: CollegeItem[];
  subjects: SubjectItem[];
  topics: TopicItem[];
  users: UserItem[];
}

export default function MasterDataViews({
  colleges,
  subjects,
  topics,
  users,
}: MasterDataProps) {
  const [activeTab, setActiveTab] = useState<"colleges" | "subjects" | "topics" | "users">("colleges");

  // Topic filter by subject
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ""
  );

  // Modal / Feedback state
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [modalType, setModalType] = useState<
    | "addCollege"
    | "renameSubject"
    | "addSubject"
    | "addTopic"
    | "renameTopic"
    | "addUser"
    | null
  >(null);

  // Form states
  const [targetId, setTargetId] = useState("");
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("STAFF");
  const [formReason, setFormReason] = useState("");

  const resetForm = () => {
    setModalType(null);
    setTargetId("");
    setFormName("");
    setFormCode("");
    setFormEmail("");
    setFormPassword("");
    setFormReason("");
  };

  const handleAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    setFeedback(null);
    try {
      await fn();
      setFeedback({ type: "success", text: successMsg });
      resetForm();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({ type: "error", text: errorMsg });
    }
  };

  return (
    <div className="space-y-6">
      {/* Segmented Control Tabs */}
      <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
        <button
          type="button"
          onClick={() => { setActiveTab("colleges"); setFeedback(null); }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "colleges"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-medium shadow-2xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          Colleges ({colleges.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("subjects"); setFeedback(null); }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "subjects"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-medium shadow-2xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
          Subjects ({subjects.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("topics"); setFeedback(null); }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "topics"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-medium shadow-2xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <ListTree className="h-3.5 w-3.5" strokeWidth={1.75} />
          Topics ({topics.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("users"); setFeedback(null); }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "users"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-medium shadow-2xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
          User Accounts ({users.length})
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg flex items-center gap-2.5 text-xs ${
            feedback.type === "success"
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
              : "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-zinc-100 shrink-0" strokeWidth={1.75} />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" strokeWidth={1.75} />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 1. Colleges Tab */}
      {activeTab === "colleges" && (
        <div className="bg-white dark:bg-[#121214] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">College Registry</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                Unique uppercase code used for atomic sequence counter allocation
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setModalType("addCollege"); }}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-2xs"
            >
              <Plus className="h-3 w-3" strokeWidth={1.75} /> Add College
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-mono text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80">
              <tr>
                <th className="py-2.5 px-4 font-normal">College Name</th>
                <th className="py-2.5 px-4 font-normal">College Code</th>
                <th className="py-2.5 px-4 text-center font-normal">Status</th>
                <th className="py-2.5 px-4 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {colleges.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">{c.name}</td>
                  <td className="py-3 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">{c.code}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono ${
                        c.isArchived
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700"
                          : "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
                      }`}
                    >
                      {c.isArchived ? "Archived" : "Active"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        const reason = prompt(
                          `Enter mandatory reason to ${
                            c.isArchived ? "restore" : "archive"
                          } ${c.name}:`
                        );
                        if (reason) {
                          handleAction(
                            () => toggleArchiveCollegeAction(c.id, reason),
                            `College ${c.isArchived ? "restored" : "archived"}.`
                          );
                        }
                      }}
                      className="text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors font-mono"
                    >
                      {c.isArchived ? "Restore" : "Archive"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Subjects Tab */}
      {activeTab === "subjects" && (
        <div className="bg-white dark:bg-[#121214] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">Subject Master</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                Top-level subject divisions with automatic topic aggregation
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setModalType("addSubject"); }}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-2xs"
            >
              <Plus className="h-3 w-3" strokeWidth={1.75} /> Add Subject
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-mono text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80">
              <tr>
                <th className="py-2.5 px-4 font-normal">Subject Name</th>
                <th className="py-2.5 px-4 text-center font-normal">Topics Count</th>
                <th className="py-2.5 px-4 text-center font-normal">Status</th>
                <th className="py-2.5 px-4 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">{s.name}</td>
                  <td className="py-3 px-4 text-center font-mono text-zinc-500 tabular-nums">{s.topicCount}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono ${
                        s.isArchived
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700"
                          : "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
                      }`}
                    >
                      {s.isArchived ? "Archived" : "Active"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-3">
                    <button
                      onClick={() => {
                        resetForm();
                        setTargetId(s.id);
                        setFormName(s.name);
                        setModalType("renameSubject");
                      }}
                      className="text-xs text-zinc-700 dark:text-zinc-300 hover:underline font-mono"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt(
                          `Enter mandatory reason to ${
                            s.isArchived ? "restore" : "archive"
                          } ${s.name}:`
                        );
                        if (reason) {
                          handleAction(
                            () => toggleArchiveSubjectAction(s.id, reason),
                            `Subject ${s.isArchived ? "restored" : "archived"}.`
                          );
                        }
                      }}
                      className="text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors font-mono"
                    >
                      {s.isArchived ? "Restore" : "Archive"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Topics Tab */}
      {activeTab === "topics" && (
        <div className="bg-white dark:bg-[#121214] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">Topic Master Registry</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                Stable internal identifiers (TOP-#####)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="h-7 px-2 text-xs font-medium bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded focus:outline-none"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id} className="dark:bg-zinc-900">
                    Filter: {sub.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => { resetForm(); setModalType("addTopic"); }}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-2xs"
              >
                <Plus className="h-3 w-3" strokeWidth={1.75} /> Add Topic
              </button>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-mono text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80">
              <tr>
                <th className="py-2.5 px-4 font-normal">Topic Code</th>
                <th className="py-2.5 px-4 font-normal">Topic Name</th>
                <th className="py-2.5 px-4 text-center font-normal">Status</th>
                <th className="py-2.5 px-4 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {topics
                .filter((t) => t.subjectId === selectedSubjectId)
                .map((top) => (
                  <tr key={top.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                      {top.topicCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">{top.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono ${
                          top.isArchived
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700"
                            : "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
                        }`}
                      >
                        {top.isArchived ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-3">
                      <button
                        onClick={() => {
                          resetForm();
                          setTargetId(top.id);
                          setFormName(top.name);
                          setModalType("renameTopic");
                        }}
                        className="text-xs text-zinc-700 dark:text-zinc-300 hover:underline font-mono"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt(
                            `Enter mandatory reason to ${
                              top.isArchived ? "restore" : "archive"
                            } ${top.name}:`
                          );
                          if (reason) {
                            handleAction(
                              () => toggleArchiveTopicAction(top.id, reason),
                              `Topic ${top.isArchived ? "restored" : "archived"}.`
                            );
                          }
                        }}
                        className="text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors font-mono"
                      >
                        {top.isArchived ? "Restore" : "Archive"}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-[#121214] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">Staff Accounts</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                Role-based access permissions (Superadmin vs Staff)
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setModalType("addUser"); }}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-2xs"
            >
              <Plus className="h-3 w-3" strokeWidth={1.75} /> Create User
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-mono text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80">
              <tr>
                <th className="py-2.5 px-4 font-normal">Name</th>
                <th className="py-2.5 px-4 font-normal">Email</th>
                <th className="py-2.5 px-4 text-center font-normal">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">{u.name}</td>
                  <td className="py-3 px-4 text-zinc-500 font-mono text-xs">{u.email}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL POPUPS */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#121214] rounded-xl shadow-2xl border border-zinc-200/90 dark:border-zinc-800/90 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">
                {modalType === "addCollege" && "Add College"}
                {modalType === "addSubject" && "Add Subject"}
                {modalType === "renameSubject" && `Rename Subject: ${formName}`}
                {modalType === "addTopic" && "Add Topic Under Subject"}
                {modalType === "renameTopic" && `Rename Topic: ${formName}`}
                {modalType === "addUser" && "Create User Account"}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="h-7 w-7 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 rounded transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Modal Body Based on Type */}
            {modalType === "addCollege" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData();
                  fd.append("name", formName);
                  fd.append("code", formCode);
                  handleAction(() => createCollegeAction(fd), "College created.");
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">College Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. D. Y. Patil College of Engineering"
                    className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                    College Code (Unique uppercase e.g. DYPCOE)
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DYPCOE"
                    className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 uppercase font-mono placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 rounded-md shadow-2xs"
                  >
                    Save College
                  </button>
                </div>
              </form>
            )}

            {modalType === "addSubject" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData();
                  fd.append("name", formName);
                  handleAction(() => createSubjectAction(fd), "Subject created with 3 difficulty tiers.");
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Data Analytics"
                    className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 rounded-md shadow-2xs"
                  >
                    Create Subject
                  </button>
                </div>
              </form>
            )}

            {modalType === "renameSubject" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAction(
                    () =>
                      renameSubjectAction({
                        id: targetId,
                        name: formName,
                        changeDescription: formReason,
                      }),
                    "Subject renamed. Examinations updated."
                  );
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">New Subject Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                    Mandatory Change Reason <span className="text-zinc-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    placeholder="Reason for renaming subject..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 rounded-md shadow-2xs"
                  >
                    Confirm Rename
                  </button>
                </div>
              </form>
            )}

            {modalType === "addTopic" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData();
                  fd.append("subjectId", selectedSubjectId);
                  fd.append("name", formName);
                  handleAction(() => createTopicAction(fd), "Topic added.");
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Topic Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Permutations and Combinations"
                    className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 rounded-md shadow-2xs"
                  >
                    Save Topic
                  </button>
                </div>
              </form>
            )}

            {modalType === "renameTopic" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAction(
                    () =>
                      renameTopicAction({
                        id: targetId,
                        name: formName,
                        changeDescription: formReason,
                      }),
                    "Topic renamed."
                  );
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">New Topic Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                    Mandatory Change Reason <span className="text-zinc-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    placeholder="Reason for renaming topic..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 rounded-md shadow-2xs"
                  >
                    Confirm Rename
                  </button>
                </div>
              </form>
            )}

            {modalType === "addUser" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData();
                  fd.append("name", formName);
                  fd.append("email", formEmail);
                  fd.append("password", formPassword);
                  fd.append("role", formRole);
                  handleAction(() => createUserAction(fd), "User account created.");
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Staff Member Name"
                    className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="user@truskill.com"
                    className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="h-8 w-full px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-200 transition-colors"
                  >
                    <option value="STAFF">STAFF (Operations)</option>
                    <option value="SUPERADMIN">SUPERADMIN (Full Control)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 rounded-md shadow-2xs"
                  >
                    Create User
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
