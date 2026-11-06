import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, History, Folder, Calendar, User, FileText } from "lucide-react";
import SubjectInventoryForm from "@/components/SubjectInventoryForm";
import { formatDateKolkata, formatNumber } from "@/lib/utils";

interface PageProps {
  params: Promise<{ subjectId: string }>;
}

export default async function SubjectDetailPage({ params }: PageProps) {
  const { subjectId } = await params;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      inventoryRecords: true,
      inventoryHistories: {
        orderBy: { createdAt: "desc" },
        include: { changedByUser: true },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  const easyRecord = subject.inventoryRecords.find((i) => i.difficultyLevel === "I_EASY");
  const mediumRecord = subject.inventoryRecords.find((i) => i.difficultyLevel === "II_MEDIUM");
  const hardRecord = subject.inventoryRecords.find((i) => i.difficultyLevel === "III_HARD");

  const easy = easyRecord?.questionCount || 0;
  const medium = mediumRecord?.questionCount || 0;
  const hard = hardRecord?.questionCount || 0;
  const total = easy + medium + hard;

  return (
    <div className="space-y-8">
      {/* Back button & Subject Title Header */}
      <div>
        <Link
          href="/question-bank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition mb-3"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Question Bank Register
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{subject.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                Subject Inventory
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Manage difficulty counts (Roman I, II, III) and corresponding folder paths.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-right">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Current Total
              </span>
              <span className="text-xl font-extrabold text-slate-900">{formatNumber(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Update Interactive Form */}
      <SubjectInventoryForm
        subjectId={subject.id}
        initialEasy={easy}
        initialMedium={medium}
        initialHard={hard}
        initialEasyFolder={easyRecord?.folderName || ""}
        initialMediumFolder={mediumRecord?.folderName || ""}
        initialHardFolder={hardRecord?.folderName || ""}
      />

      {/* Historical Inventory Update Records (PRD Section 5.9) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Inventory Modification History</h2>
          </div>
          <span className="text-xs text-slate-500">
            {subject.inventoryHistories.length} historical updates recorded
          </span>
        </div>

        {subject.inventoryHistories.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No previous manual updates recorded yet for this subject.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Updated By</th>
                  <th className="py-3 px-4 text-center">Easy (I)</th>
                  <th className="py-3 px-4 text-center">Medium (II)</th>
                  <th className="py-3 px-4 text-center">Hard (III)</th>
                  <th className="py-3 px-4">Mandatory Change Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subject.inventoryHistories.map((hist) => (
                  <tr key={hist.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                      {formatDateKolkata(hist.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                      {hist.changedByUser.name}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs">
                      <div className="flex items-center justify-center gap-1.5 font-medium">
                        <span className="text-slate-400">{hist.prevEasy}</span>
                        <span className="text-slate-300">→</span>
                        <span className="text-emerald-700 font-bold">{hist.newEasy}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs">
                      <div className="flex items-center justify-center gap-1.5 font-medium">
                        <span className="text-slate-400">{hist.prevMedium}</span>
                        <span className="text-slate-300">→</span>
                        <span className="text-amber-700 font-bold">{hist.newMedium}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs">
                      <div className="flex items-center justify-center gap-1.5 font-medium">
                        <span className="text-slate-400">{hist.prevHard}</span>
                        <span className="text-slate-300">→</span>
                        <span className="text-red-700 font-bold">{hist.newHard}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700 font-medium">
                      {hist.changeDescription}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
