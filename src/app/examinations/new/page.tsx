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
      <div>
        <Link
          href="/examinations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition mb-3"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Examination Registry
        </Link>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h1 className="text-2xl font-bold text-slate-900">Add New Examination</h1>
          <p className="mt-1 text-sm text-slate-500">
            Register an examination in the centralized repository. Select category, generate unique sequence code, and configure metadata.
          </p>
        </div>
      </div>

      <AddExamWizard colleges={colleges} />
    </div>
  );
}
