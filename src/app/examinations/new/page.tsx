import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AddExamWizard from "@/components/AddExamWizard";

export default async function NewExaminationPage() {
  const colleges = await prisma.college.findMany({
    where: { isArchived: false },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[var(--border-hairline)]">
        <Link
          href="/examinations"
          className="craft-button-secondary inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium mb-4"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} /> Back to Examination Registry
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              Register New Examination
            </h1>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              Configure delivery constraints, institutional parameters, and generate standardized deterministic naming sequence
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Formula Generator Ready
            </span>
          </div>
        </div>
      </div>

      <AddExamWizard colleges={colleges} />
    </div>
  );
}
