"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function updateSubjectInventoryAction(params: {
  subjectId: string;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  easyFolder: string;
  mediumFolder: string;
  hardFolder: string;
  changeDescription: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in to perform this action.");
  }

  if (!params.changeDescription || params.changeDescription.trim().length === 0) {
    throw new Error("A change description is mandatory for updating question inventory.");
  }

  if (params.easyCount < 0 || params.mediumCount < 0 || params.hardCount < 0) {
    throw new Error("Question counts cannot be negative numbers.");
  }

  // Fetch previous counts
  const currentInventories = await prisma.questionBankInventory.findMany({
    where: { subjectId: params.subjectId },
  });

  const prevEasy = currentInventories.find((i) => i.difficultyLevel === "I_EASY")?.questionCount || 0;
  const prevMedium = currentInventories.find((i) => i.difficultyLevel === "II_MEDIUM")?.questionCount || 0;
  const prevHard = currentInventories.find((i) => i.difficultyLevel === "III_HARD")?.questionCount || 0;

  const prevFolders = {
    easy: currentInventories.find((i) => i.difficultyLevel === "I_EASY")?.folderName || "",
    medium: currentInventories.find((i) => i.difficultyLevel === "II_MEDIUM")?.folderName || "",
    hard: currentInventories.find((i) => i.difficultyLevel === "III_HARD")?.folderName || "",
  };

  const newFolders = {
    easy: params.easyFolder.trim(),
    medium: params.mediumFolder.trim(),
    hard: params.hardFolder.trim(),
  };

  // Execute update in a transaction
  await prisma.$transaction(async (tx) => {
    // 1. Update/Upsert the 3 difficulty levels
    const levels = [
      { level: "I_EASY", count: params.easyCount, folder: params.easyFolder },
      { level: "II_MEDIUM", count: params.mediumCount, folder: params.mediumFolder },
      { level: "III_HARD", count: params.hardCount, folder: params.hardFolder },
    ];

    for (const item of levels) {
      await tx.questionBankInventory.upsert({
        where: {
          subjectId_difficultyLevel: {
            subjectId: params.subjectId,
            difficultyLevel: item.level,
          },
        },
        update: {
          questionCount: item.count,
          folderName: item.folder.trim(),
          lastUpdatedBy: user.id,
        },
        create: {
          subjectId: params.subjectId,
          difficultyLevel: item.level,
          questionCount: item.count,
          folderName: item.folder.trim(),
          lastUpdatedBy: user.id,
        },
      });
    }

    // 2. Insert into InventoryHistory
    await tx.inventoryHistory.create({
      data: {
        subjectId: params.subjectId,
        prevEasy,
        newEasy: params.easyCount,
        prevMedium,
        newMedium: params.mediumCount,
        prevHard,
        newHard: params.hardCount,
        prevFolders: JSON.stringify(prevFolders),
        newFolders: JSON.stringify(newFolders),
        changeDescription: params.changeDescription.trim(),
        changedBy: user.id,
      },
    });

    // 3. Record Audit Log
    await tx.auditLog.create({
      data: {
        entityType: "QUESTION_BANK",
        entityId: params.subjectId,
        action: "UPDATE",
        prevValue: JSON.stringify({ easy: prevEasy, medium: prevMedium, hard: prevHard, folders: prevFolders }),
        newValue: JSON.stringify({
          easy: params.easyCount,
          medium: params.mediumCount,
          hard: params.hardCount,
          folders: newFolders,
        }),
        changeDescription: params.changeDescription.trim(),
        changedBy: user.id,
      },
    });
  });

  revalidatePath("/question-bank");
  revalidatePath(`/question-bank/${params.subjectId}`);
  revalidatePath("/dashboard");

  return { success: true };
}
