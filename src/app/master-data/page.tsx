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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--border-hairline)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              Master Data Governance
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Shield className="h-3.5 w-3.5" strokeWidth={1.5} /> Superadmin Access
            </span>
          </div>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Manage institutional partner colleges, academic subjects, topic taxonomies, and authenticated staff credentials with immutable audit preservation
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
