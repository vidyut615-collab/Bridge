"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function updateTopicInventoryAction(params: {
  topicId: string;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  folderName: string;
  changeDescription: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in to perform this action.");
  }

  if (!params.changeDescription || params.changeDescription.trim().length === 0) {
    throw new Error("A change description is mandatory for updating topic question inventory.");
  }

  if (params.easyCount < 0 || params.mediumCount < 0 || params.hardCount < 0) {
    throw new Error("Question counts cannot be negative numbers.");
  }

  const topic = await prisma.topic.findUnique({
    where: { id: params.topicId },
    include: { subject: true },
  });

  if (!topic) {
    throw new Error("Topic not found.");
  }

  const prevEasy = topic.easyCount;
  const prevMedium = topic.mediumCount;
  const prevHard = topic.hardCount;
  const prevFolder = topic.folderName;

  await prisma.$transaction(async (tx) => {
    // 1. Update Topic counts
    await tx.topic.update({
      where: { id: params.topicId },
      data: {
        easyCount: params.easyCount,
        mediumCount: params.mediumCount,
        hardCount: params.hardCount,
        folderName: params.folderName.trim(),
      },
    });

    // 2. Insert into TopicInventoryHistory
    await tx.topicInventoryHistory.create({
      data: {
        topicId: params.topicId,
        prevEasy,
        newEasy: params.easyCount,
        prevMedium,
        newMedium: params.mediumCount,
        prevHard,
        newHard: params.hardCount,
        prevFolder,
        newFolder: params.folderName.trim(),
        changeDescription: params.changeDescription.trim(),
        changedBy: user.id,
      },
    });

    // 3. Record Audit Log
    await recordAuditLog({
      entityType: "QUESTION_BANK",
      entityId: params.topicId,
      action: "UPDATE",
      changeDescription: `Updated inventory for topic "${topic.name}" under ${topic.subject.name}: Easy ${prevEasy}->${params.easyCount}, Med ${prevMedium}->${params.mediumCount}, Hard ${prevHard}->${params.hardCount}. Reason: ${params.changeDescription}`,
      userId: user.id,
      previousValues: {
        easy: prevEasy,
        medium: prevMedium,
        hard: prevHard,
        folder: prevFolder,
      },
      newValues: {
        easy: params.easyCount,
        medium: params.mediumCount,
        hard: params.hardCount,
        folder: params.folderName.trim(),
      },
    });
  });

  revalidatePath("/question-bank");
  revalidatePath(`/question-bank/${topic.subjectId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function updateBatchTopicsInventoryAction(params: {
  subjectId: string;
  topics: {
    topicId: string;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    folderName: string;
  }[];
  changeDescription: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in to perform this action.");
  }

  if (!params.changeDescription || params.changeDescription.trim().length === 0) {
    throw new Error("A change description is mandatory for updating question inventory.");
  }

  const subject = await prisma.subject.findUnique({
    where: { id: params.subjectId },
    include: { topics: true },
  });

  if (!subject) {
    throw new Error("Subject not found.");
  }

  await prisma.$transaction(async (tx) => {
    for (const t of params.topics) {
      if (t.easyCount < 0 || t.mediumCount < 0 || t.hardCount < 0) {
        throw new Error("Question counts cannot be negative numbers.");
      }

      const existing = subject.topics.find((mt) => mt.id === t.topicId);
      if (!existing) continue;

      const hasChanged =
        existing.easyCount !== t.easyCount ||
        existing.mediumCount !== t.mediumCount ||
        existing.hardCount !== t.hardCount ||
        existing.folderName !== t.folderName.trim();

      if (hasChanged) {
        await tx.topic.update({
          where: { id: t.topicId },
          data: {
            easyCount: t.easyCount,
            mediumCount: t.mediumCount,
            hardCount: t.hardCount,
            folderName: t.folderName.trim(),
          },
        });

        await tx.topicInventoryHistory.create({
          data: {
            topicId: t.topicId,
            prevEasy: existing.easyCount,
            newEasy: t.easyCount,
            prevMedium: existing.mediumCount,
            newMedium: t.mediumCount,
            prevHard: existing.hardCount,
            newHard: t.hardCount,
            prevFolder: existing.folderName,
            newFolder: t.folderName.trim(),
            changeDescription: params.changeDescription.trim(),
            changedBy: user.id,
          },
        });
      }
    }

    await recordAuditLog({
      entityType: "QUESTION_BANK",
      entityId: params.subjectId,
      action: "UPDATE",
      changeDescription: `Batch updated topic inventories for subject "${subject.name}". Reason: ${params.changeDescription}`,
      userId: user.id,
      newValues: {
        updatedTopicsCount: params.topics.length,
      },
    });
  });

  revalidatePath("/question-bank");
  revalidatePath(`/question-bank/${params.subjectId}`);
  revalidatePath("/dashboard");

  return { success: true };
}
