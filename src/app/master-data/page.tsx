import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import MasterDataViews from "@/components/MasterDataViews";
import { Shield } from "lucide-react";

export default async function MasterDataPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const colleges = await prisma.college.findMany({
    orderBy: { name: "asc" },
  });

  const subjects = await prisma.subject.findMany({
    include: {
      topics: true,
    },
    orderBy: { name: "asc" },
  });

  const topics = await prisma.topic.findMany({
    orderBy: { topicCode: "asc" },
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header — Flat, Minimalist */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Master Data Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
              <Shield className="h-3 w-3" /> Superadmin Protected
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Maintain centralized Colleges, Subjects, Topics, and Staff Accounts. Soft-delete and historical stability enforced.
          </p>
        </div>
      </div>

      <MasterDataViews
        colleges={colleges}
        subjects={subjects.map((s) => ({
          id: s.id,
          name: s.name,
          isArchived: s.isArchived,
          topicCount: s.topics.length,
        }))}
        topics={topics.map((t) => ({
          id: t.id,
          topicCode: t.topicCode,
          name: t.name,
          subjectId: t.subjectId,
          isArchived: t.isArchived,
        }))}
        users={users}
      />
    </div>
  );
}
