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
    <div className="space-y-6">
      {/* Header — Flat, Minimalist */}
      <div className="pb-5 border-b border-zinc-200/80 dark:border-zinc-800">
        <Link
          href="/examinations"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-3"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Examination Registry
        </Link>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Add New Examination
        </h1>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Register an assessment in the centralized repository. Select category, generate standardized naming sequence, and configure delivery parameters.
        </p>
      </div>

      <AddExamWizard colleges={colleges} />
    </div>
  );
}
