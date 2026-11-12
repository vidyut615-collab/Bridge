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
      {/* Header */}
      <div className="pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
        <Link
          href="/examinations"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-150 mb-3"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} /> Back to examination registry
        </Link>
        <h1 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          Register examination
        </h1>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Configure delivery constraints and generate standardized atomic sequence formula
        </p>
      </div>

      <AddExamWizard colleges={colleges} />
    </div>
  );
}
