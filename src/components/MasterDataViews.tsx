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
    | "archiveConfirm"
    | null
  >(null);
  const [archiveTarget, setArchiveTarget] = useState<{
    id: string;
    name: string;
    type: "college" | "subject" | "topic";
    isArchived: boolean;
  } | null>(null);

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
    setArchiveTarget(null);
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
      <div className="craft-card-subtle p-1.5 inline-flex flex-wrap items-center gap-1.5 border border-[var(--border-hairline)] rounded-xl text-sm">
        <button
          type="button"
          onClick={() => { setActiveTab("colleges"); setFeedback(null); }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-150 ${
            activeTab === "colleges"
              ? "bg-[var(--bg-raised)] text-[var(--text-primary)] font-semibold shadow-sm border border-[var(--border-hairline)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]/40 font-medium"
          }`}
        >
          <Building2 className="h-4 w-4" strokeWidth={1.5} />
          Colleges ({colleges.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("subjects"); setFeedback(null); }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-150 ${
            activeTab === "subjects"
              ? "bg-[var(--bg-raised)] text-[var(--text-primary)] font-semibold shadow-sm border border-[var(--border-hairline)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]/40 font-medium"
          }`}
        >
          <BookOpen className="h-4 w-4" strokeWidth={1.5} />
          Subjects ({subjects.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("topics"); setFeedback(null); }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-150 ${
            activeTab === "topics"
              ? "bg-[var(--bg-raised)] text-[var(--text-primary)] font-semibold shadow-sm border border-[var(--border-hairline)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]/40 font-medium"
          }`}
        >
          <ListTree className="h-4 w-4" strokeWidth={1.5} />
          Topics ({topics.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("users"); setFeedback(null); }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-150 ${
            activeTab === "users"
              ? "bg-[var(--bg-raised)] text-[var(--text-primary)] font-semibold shadow-sm border border-[var(--border-hairline)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]/40 font-medium"
          }`}
        >
          <Users className="h-4 w-4" strokeWidth={1.5} />
          User Accounts ({users.length})
        </button>
      </div>

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

      {/* 1. Colleges Tab */}
      {activeTab === "colleges" && (
        <div className="craft-card overflow-hidden">
          <div className="px-6 py-4 bg-[var(--bg-raised)] border-b border-[var(--border-hairline)] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Institutional College Registry</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                Unique uppercase code used for atomic sequence counter allocation
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setModalType("addCollege"); }}
              className="craft-button-primary inline-flex items-center gap-2 h-9 px-4 text-xs font-medium"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} /> Add College
            </button>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-raised)]/60 text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
              <tr>
                <th className="py-3 px-4">College Name</th>
                <th className="py-3 px-4">College Code</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {colleges.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--bg-raised)]/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">{c.name}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[var(--text-primary)]">{c.code}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-medium ${
                        c.isArchived
                          ? "bg-[var(--bg-raised)] text-[var(--text-muted)] border border-[var(--border-hairline)]"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {c.isArchived ? "Archived" : "Active"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        resetForm();
                        setArchiveTarget({
                          id: c.id,
                          name: c.name,
                          type: "college",
                          isArchived: c.isArchived,
                        });
                        setModalType("archiveConfirm");
                      }}
                      className="craft-button-secondary inline-flex items-center h-7 px-3 text-xs font-mono font-medium"
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
        <div className="craft-card overflow-hidden">
          <div className="px-6 py-4 bg-[var(--bg-raised)] border-b border-[var(--border-hairline)] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Academic Subject Master</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                Top-level subject divisions with automatic topic inventory aggregation
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setModalType("addSubject"); }}
              className="craft-button-primary inline-flex items-center gap-2 h-9 px-4 text-xs font-medium"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} /> Add Subject
            </button>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-raised)]/60 text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
              <tr>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4 text-center">Topics Count</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--bg-raised)]/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">{s.name}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-[var(--text-primary)] tabular-nums">{s.topicCount}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-medium ${
                        s.isArchived
                          ? "bg-[var(--bg-raised)] text-[var(--text-muted)] border border-[var(--border-hairline)]"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {s.isArchived ? "Archived" : "Active"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        resetForm();
                        setTargetId(s.id);
                        setFormName(s.name);
                        setModalType("renameSubject");
                      }}
                      className="craft-button-secondary inline-flex items-center h-7 px-2.5 text-xs font-medium"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        resetForm();
                        setArchiveTarget({
                          id: s.id,
                          name: s.name,
                          type: "subject",
                          isArchived: s.isArchived,
                        });
                        setModalType("archiveConfirm");
                      }}
                      className="craft-button-secondary inline-flex items-center h-7 px-2.5 text-xs font-mono font-medium"
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
        <div className="craft-card overflow-hidden">
          <div className="px-6 py-4 bg-[var(--bg-raised)] border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Topic Master Taxonomy</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                Stable internal identifiers (TOP-#####)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="h-9 px-3 text-xs font-medium bg-[var(--bg-card)] border border-[var(--border-hairline)] text-[var(--text-primary)] rounded-lg focus:border-indigo-500 focus:outline-none"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id} className="dark:bg-[#11141c]">
                    Filter: {sub.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => { resetForm(); setModalType("addTopic"); }}
                className="craft-button-primary inline-flex items-center gap-2 h-9 px-4 text-xs font-medium"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} /> Add Topic
              </button>
            </div>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-raised)]/60 text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
              <tr>
                <th className="py-3 px-4">Topic Code</th>
                <th className="py-3 px-4">Topic Name</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {topics
                .filter((t) => t.subjectId === selectedSubjectId)
                .map((top) => (
                  <tr key={top.id} className="hover:bg-[var(--bg-raised)]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-secondary)]">
                      {top.topicCode}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">{top.name}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-medium ${
                          top.isArchived
                            ? "bg-[var(--bg-raised)] text-[var(--text-muted)] border border-[var(--border-hairline)]"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {top.isArchived ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          resetForm();
                          setTargetId(top.id);
                          setFormName(top.name);
                          setModalType("renameTopic");
                        }}
                        className="craft-button-secondary inline-flex items-center h-7 px-2.5 text-xs font-medium"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          resetForm();
                          setArchiveTarget({
                            id: top.id,
                            name: top.name,
                            type: "topic",
                            isArchived: top.isArchived,
                          });
                          setModalType("archiveConfirm");
                        }}
                        className="craft-button-secondary inline-flex items-center h-7 px-2.5 text-xs font-mono font-medium"
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
        <div className="craft-card overflow-hidden">
          <div className="px-6 py-4 bg-[var(--bg-raised)] border-b border-[var(--border-hairline)] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Staff Credentials & RBAC</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                Role-based access permissions (Superadmin vs Operations Staff)
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setModalType("addUser"); }}
              className="craft-button-primary inline-flex items-center gap-2 h-9 px-4 text-xs font-medium"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} /> Create User
            </button>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-raised)]/60 text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border-hairline)]">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--bg-raised)]/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">{u.name}</td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)] font-mono text-xs">{u.email}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[var(--bg-raised)] text-[var(--text-primary)] border border-[var(--border-hairline)]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md craft-card p-6 space-y-5 border border-[var(--border-hairline)] shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {modalType === "addCollege" && "Add College"}
                {modalType === "addSubject" && "Add Subject"}
                {modalType === "renameSubject" && `Rename Subject: ${formName}`}
                {modalType === "addTopic" && "Add Topic"}
                {modalType === "renameTopic" && `Rename Topic: ${formName}`}
                {modalType === "addUser" && "Create User Account"}
                {modalType === "archiveConfirm" &&
                  archiveTarget &&
                  `${archiveTarget.isArchived ? "Restore" : "Archive"} ${archiveTarget.name}`}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="h-8 w-8 inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] rounded-lg transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
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
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">College Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. D. Y. Patil College of Engineering"
                    className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    College Code (Unique uppercase e.g. DYPCOE)
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DYPCOE"
                    className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] uppercase font-mono placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="craft-button-secondary h-9 px-4 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="craft-button-primary h-9 px-5 text-xs font-medium"
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
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Data Analytics"
                    className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="craft-button-secondary h-9 px-4 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="craft-button-primary h-9 px-5 text-xs font-medium"
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
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">New Subject Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Mandatory Change Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    placeholder="Reason for renaming subject..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="craft-button-secondary h-9 px-4 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="craft-button-primary h-9 px-5 text-xs font-medium"
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
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Topic Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Permutations and Combinations"
                    className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="craft-button-secondary h-9 px-4 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="craft-button-primary h-9 px-5 text-xs font-medium"
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
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">New Topic Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Mandatory Change Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    placeholder="Reason for renaming topic..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="craft-button-secondary h-9 px-4 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="craft-button-primary h-9 px-5 text-xs font-medium"
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
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Staff member name"
                    className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="user@truskill.com"
                    className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Role Permission</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="h-10 w-full px-3.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none transition-colors"
                  >
                    <option value="STAFF">STAFF (Operations)</option>
                    <option value="SUPERADMIN">SUPERADMIN (Full control)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="craft-button-secondary h-9 px-4 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="craft-button-primary h-9 px-5 text-xs font-medium"
                  >
                    Create User
                  </button>
                </div>
              </form>
            )}

            {modalType === "archiveConfirm" && archiveTarget && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!formReason.trim()) return;
                  if (archiveTarget.type === "college") {
                    handleAction(
                      () => toggleArchiveCollegeAction(archiveTarget.id, formReason),
                      `College ${archiveTarget.isArchived ? "restored" : "archived"}.`
                    );
                  } else if (archiveTarget.type === "subject") {
                    handleAction(
                      () => toggleArchiveSubjectAction(archiveTarget.id, formReason),
                      `Subject ${archiveTarget.isArchived ? "restored" : "archived"}.`
                    );
                  } else if (archiveTarget.type === "topic") {
                    handleAction(
                      () => toggleArchiveTopicAction(archiveTarget.id, formReason),
                      `Topic ${archiveTarget.isArchived ? "restored" : "archived"}.`
                    );
                  }
                }}
                className="space-y-4"
              >
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Confirm that you want to {archiveTarget.isArchived ? "restore" : "archive"}{" "}
                  <span className="font-semibold text-[var(--text-primary)]">{archiveTarget.name}</span>. An audit justification is mandatory for compliance recording.
                </p>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Mandatory Justification Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    placeholder={`Reason for ${archiveTarget.isArchived ? "restoring" : "archiving"} this record...`}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="craft-button-secondary h-9 px-4 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="craft-button-primary h-9 px-5 text-xs font-medium"
                  >
                    Confirm {archiveTarget.isArchived ? "Restore" : "Archive"}
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
