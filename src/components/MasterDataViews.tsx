"use client";

import { useState } from "react";
import {
  createCollegeAction,
  updateCollegeAction,
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
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/[0.08] gap-2">
        <button
          onClick={() => { setActiveTab("colleges"); setFeedback(null); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === "colleges"
              ? "border-[#5e6ad2] text-[#5e6ad2] dark:text-[#8b95f6]"
              : "border-transparent text-slate-500 dark:text-[#8a8f98] hover:text-slate-800 dark:hover:text-[#f7f8f8]"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Colleges ({colleges.length})
        </button>

        <button
          onClick={() => { setActiveTab("subjects"); setFeedback(null); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === "subjects"
              ? "border-[#5e6ad2] text-[#5e6ad2] dark:text-[#8b95f6]"
              : "border-transparent text-slate-500 dark:text-[#8a8f98] hover:text-slate-800 dark:hover:text-[#f7f8f8]"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Subjects ({subjects.length})
        </button>

        <button
          onClick={() => { setActiveTab("topics"); setFeedback(null); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === "topics"
              ? "border-[#5e6ad2] text-[#5e6ad2] dark:text-[#8b95f6]"
              : "border-transparent text-slate-500 dark:text-[#8a8f98] hover:text-slate-800 dark:hover:text-[#f7f8f8]"
          }`}
        >
          <ListTree className="h-4 w-4" />
          Topics ({topics.length})
        </button>

        <button
          onClick={() => { setActiveTab("users"); setFeedback(null); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === "users"
              ? "border-[#5e6ad2] text-[#5e6ad2] dark:text-[#8b95f6]"
              : "border-transparent text-slate-500 dark:text-[#8a8f98] hover:text-slate-800 dark:hover:text-[#f7f8f8]"
          }`}
        >
          <Users className="h-4 w-4" />
          User Accounts ({users.length})
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/30"
              : "bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-[#eb5757] border border-rose-200 dark:border-rose-500/30"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-[#27a644] shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-[#eb5757] shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 1. Colleges Tab */}
      {activeTab === "colleges" && (
        <div className="bg-white dark:bg-[#0f1011] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">College Master Registry</h2>
              <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-0.5">
                Standardized colleges and unique codes used in automated examination naming.
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setModalType("addCollege"); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5e6ad2] hover:bg-[#6875e5] text-white text-xs font-semibold shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.35)] transition"
            >
              <Plus className="h-4 w-4" /> Add College
            </button>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-[#141516] text-xs uppercase font-semibold text-slate-600 dark:text-[#8a8f98] border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">College Name</th>
                <th className="py-3 px-4">College Code</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {colleges.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-[#f7f8f8]">{c.name}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#5e6ad2] dark:text-[#8b95f6]">{c.code}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-mono ${
                        c.isArchived
                          ? "bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-[#8a8f98] border border-slate-200 dark:border-white/[0.08]"
                          : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/20"
                      }`}
                    >
                      {c.isArchived ? "Archived" : "Active"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => {
                        const reason = prompt(
                          `Please enter a mandatory change reason to ${
                            c.isArchived ? "restore" : "archive"
                          } ${c.name}:`
                        );
                        if (reason) {
                          handleAction(
                            () => toggleArchiveCollegeAction(c.id, reason),
                            `College ${c.isArchived ? "restored" : "archived"} successfully.`
                          );
                        }
                      }}
                      className="text-xs font-semibold text-slate-500 dark:text-[#8a8f98] hover:text-[#5e6ad2] dark:hover:text-[#8b95f6] transition"
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
        <div className="bg-white dark:bg-[#0f1011] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">Subject Master</h2>
              <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-0.5">
                Top-level subjects. Renaming propagates to all examinations referencing them.
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setModalType("addSubject"); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5e6ad2] hover:bg-[#6875e5] text-white text-xs font-semibold shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.35)] transition"
            >
              <Plus className="h-4 w-4" /> Add Subject
            </button>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-[#141516] text-xs uppercase font-semibold text-slate-600 dark:text-[#8a8f98] border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4 text-center">Topics Count</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-[#f7f8f8]">{s.name}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-600 dark:text-[#8a8f98]">{s.topicCount}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-mono ${
                        s.isArchived
                          ? "bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-[#8a8f98] border border-slate-200 dark:border-white/[0.08]"
                          : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/20"
                      }`}
                    >
                      {s.isArchived ? "Archived" : "Active"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center space-x-3">
                    <button
                      onClick={() => {
                        resetForm();
                        setTargetId(s.id);
                        setFormName(s.name);
                        setModalType("renameSubject");
                      }}
                      className="text-xs font-semibold text-[#5e6ad2] dark:text-[#8b95f6] hover:underline"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt(
                          `Please enter a mandatory change reason to ${
                            s.isArchived ? "restore" : "archive"
                          } ${s.name}:`
                        );
                        if (reason) {
                          handleAction(
                            () => toggleArchiveSubjectAction(s.id, reason),
                            `Subject ${s.isArchived ? "restored" : "archived"} successfully.`
                          );
                        }
                      }}
                      className="text-xs font-semibold text-slate-500 dark:text-[#8a8f98] hover:text-[#5e6ad2] dark:hover:text-[#8b95f6]"
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
        <div className="bg-white dark:bg-[#0f1011] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">Topic Master Registry</h2>
              <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-0.5">
                Every topic has a stable internal ID (<code className="text-[#5e6ad2] dark:text-[#8b95f6] font-mono">TOP-#####</code>). Only active topics appear in autocomplete.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-[#141516] border border-slate-300 dark:border-white/[0.12] text-slate-900 dark:text-[#f7f8f8] rounded-xl focus:ring-2 focus:ring-[#5e6ad2]"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id} className="dark:bg-[#141516]">
                    Filter: {sub.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => { resetForm(); setModalType("addTopic"); }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5e6ad2] hover:bg-[#6875e5] text-white text-xs font-semibold shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.35)] transition"
              >
                <Plus className="h-4 w-4" /> Add Topic
              </button>
            </div>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-[#141516] text-xs uppercase font-semibold text-slate-600 dark:text-[#8a8f98] border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Topic Code</th>
                <th className="py-3 px-4">Topic Name</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {topics
                .filter((t) => t.subjectId === selectedSubjectId)
                .map((top) => (
                  <tr key={top.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-500 dark:text-[#8a8f98]">
                      {top.topicCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-[#f7f8f8]">{top.name}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-mono ${
                          top.isArchived
                            ? "bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-[#8a8f98] border border-slate-200 dark:border-white/[0.08]"
                            : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-[#27a644] border border-emerald-200 dark:border-emerald-500/20"
                        }`}
                      >
                        {top.isArchived ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center space-x-3">
                      <button
                        onClick={() => {
                          resetForm();
                          setTargetId(top.id);
                          setFormName(top.name);
                          setModalType("renameTopic");
                        }}
                        className="text-xs font-semibold text-[#5e6ad2] dark:text-[#8b95f6] hover:underline"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt(
                            `Please enter a mandatory change reason to ${
                              top.isArchived ? "restore" : "archive"
                            } ${top.name}:`
                          );
                          if (reason) {
                            handleAction(
                              () => toggleArchiveTopicAction(top.id, reason),
                              `Topic ${top.isArchived ? "restored" : "archived"} successfully.`
                            );
                          }
                        }}
                        className="text-xs font-semibold text-slate-500 dark:text-[#8a8f98] hover:text-[#5e6ad2] dark:hover:text-[#8b95f6]"
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
        <div className="bg-white dark:bg-[#0f1011] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#f7f8f8]">User Account Management</h2>
              <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-0.5">
                Staff accounts handle day-to-day operations. Superadmins have master data access.
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setModalType("addUser"); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5e6ad2] hover:bg-[#6875e5] text-white text-xs font-semibold shadow-xs dark:shadow-[0_0_20px_rgba(94,106,210,0.35)] transition"
            >
              <Plus className="h-4 w-4" /> Create User
            </button>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-[#141516] text-xs uppercase font-semibold text-slate-600 dark:text-[#8a8f98] border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-[#f7f8f8]">{u.name}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-[#8a8f98] font-mono text-xs">{u.email}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold font-mono ${
                        u.role === "SUPERADMIN"
                          ? "bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30"
                          : "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                      }`}
                    >
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
          <div className="w-full max-w-md bg-white dark:bg-[#0f1011] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.12] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#f7f8f8]">
                {modalType === "addCollege" && "Add New College Master"}
                {modalType === "addSubject" && "Add New Subject"}
                {modalType === "renameSubject" && `Rename Subject: ${formName}`}
                {modalType === "addTopic" && "Add New Topic Under Subject"}
                {modalType === "renameTopic" && `Rename Topic: ${formName}`}
                {modalType === "addUser" && "Create User Account"}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="p-1.5 text-slate-400 dark:text-[#8a8f98] hover:text-slate-700 dark:hover:text-[#f7f8f8] rounded-lg"
              >
                <X className="h-4 w-4" />
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
                  handleAction(() => createCollegeAction(fd), "College created successfully.");
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">College Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. D. Y. Patil College of Engineering"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] placeholder-slate-400 dark:placeholder-[#62666d]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
                    College Code (Unique uppercase e.g. DYPCOE)
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DYPCOE"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8] uppercase font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-[#8a8f98] hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#5e6ad2] hover:bg-[#6875e5] rounded-lg shadow-xs"
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Data Analytics"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-[#8a8f98] hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#5e6ad2] hover:bg-[#6875e5] rounded-lg shadow-xs"
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
                    "Subject renamed successfully. Display updated across all examinations."
                  );
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">New Subject Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
                    Mandatory Change Reason <span className="text-[#eb5757]">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    placeholder="Reason for renaming subject..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-[#8a8f98] hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#5e6ad2] hover:bg-[#6875e5] rounded-lg shadow-xs"
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
                  handleAction(() => createTopicAction(fd), "Topic added successfully.");
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">Topic Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Permutations and Combinations"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-[#8a8f98] hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#5e6ad2] hover:bg-[#6875e5] rounded-lg shadow-xs"
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
                    "Topic renamed successfully."
                  );
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">New Topic Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">
                    Mandatory Change Reason <span className="text-[#eb5757]">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    placeholder="Reason for renaming topic..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-[#8a8f98] hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#5e6ad2] hover:bg-[#6875e5] rounded-lg shadow-xs"
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
                  handleAction(() => createUserAction(fd), "User account created successfully.");
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Staff Member Name"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="user@truskill.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#d0d3d8] mb-1">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#141516] text-slate-900 dark:text-[#f7f8f8]"
                  >
                    <option value="STAFF" className="dark:bg-[#141516]">STAFF (Operations)</option>
                    <option value="SUPERADMIN" className="dark:bg-[#141516]">SUPERADMIN (Full Administrative Control)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-[#8a8f98] hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#5e6ad2] hover:bg-[#6875e5] rounded-lg shadow-xs"
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
