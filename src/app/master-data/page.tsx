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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Master Data Management</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              <Shield className="h-3 w-3" /> Superadmin Controlled
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
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
