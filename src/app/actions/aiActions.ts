"use server";

import { extractBlueprintFromImage, ExtractedBlueprintResult } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export interface ReconciledTopic {
  extractedTopicName: string;
  questionCount: number;
  level1Easy: number;
  level2Medium: number;
  level3Hard: number;
  matchedTopicId: string | null;
  matchedTopicName: string | null;
  isUnmatched: boolean;
}

export interface ReconciledBlueprintResult {
  uploadId: string;
  sectionName: string;
  totalQuestions: number;
  topics: ReconciledTopic[];
  availableMasterTopics: { id: string; name: string }[];
}

// Simple string normalization for fuzzy comparison
function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function processBlueprintImageAction(params: {
  sectionId: string;
  subjectId: string;
  base64Image: string;
  mimeType: string;
}): Promise<ReconciledBlueprintResult> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized.");

  // 1. Query all active master topics for this subject
  const masterTopics = await prisma.topic.findMany({
    where: {
      subjectId: params.subjectId,
      isArchived: false,
    },
    select: { id: true, name: true },
  });

  // 2. Call Groq Vision API
  const extracted: ExtractedBlueprintResult = await extractBlueprintFromImage(
    params.base64Image,
    params.mimeType
  );

  // 3. Reconcile extracted topics with master topics
  const reconciledTopics: ReconciledTopic[] = extracted.topics.map((t) => {
    const rawName = t.extracted_topic_name.trim();
    const normalizedRaw = normalizeString(rawName);

    // Exact match check first
    let matched = masterTopics.find(
      (m) => m.name.toLowerCase() === rawName.toLowerCase()
    );

    // If no exact match, try normalized check
    if (!matched) {
      matched = masterTopics.find(
        (m) => normalizeString(m.name) === normalizedRaw
      );
    }

    // If still no match, check if one contains the other
    if (!matched) {
      matched = masterTopics.find(
        (m) =>
          normalizeString(m.name).includes(normalizedRaw) ||
          normalizedRaw.includes(normalizeString(m.name))
      );
    }

    return {
      extractedTopicName: rawName,
      questionCount: t.question_count || 0,
      level1Easy: t.difficulty_distribution?.level_1_easy || 0,
      level2Medium: t.difficulty_distribution?.level_2_medium || 0,
      level3Hard: t.difficulty_distribution?.level_3_hard || 0,
      matchedTopicId: matched ? matched.id : null,
      matchedTopicName: matched ? matched.name : null,
      isUnmatched: !matched,
    };
  });

  // 4. Save upload record to database
  const upload = await prisma.blueprintUpload.create({
    data: {
      sectionId: params.sectionId,
      imageUrl: "data:" + params.mimeType + ";base64,[STORED_IN_MEMORY_PREVIEW]",
      rawExtractedJson: JSON.stringify(extracted),
      extractionStatus: reconciledTopics.some((r) => r.isUnmatched) ? "EXTRACTED" : "RESOLVED",
      uploadedBy: user.id,
    },
  });

  return {
    uploadId: upload.id,
    sectionName: extracted.section_name || "Section Blueprint",
    totalQuestions: extracted.total_questions || reconciledTopics.reduce((s, t) => s + t.questionCount, 0),
    topics: reconciledTopics,
    availableMasterTopics: masterTopics,
  };
}
