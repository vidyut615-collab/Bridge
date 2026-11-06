"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

// Format unique sequence code with leading zeros (e.g. 1 -> "001")
function formatSequenceCode(num: number): string {
  return String(num).padStart(3, "0");
}

// Clean and format examination title per PRD Section 8.6
function cleanTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, " "); // Replace multiple consecutive spaces with a single space
}

// ----------------------------------------------------
// 1. Preview Examination Name
// ----------------------------------------------------
export async function previewExamNameAction(params: {
  category: "GLOBAL" | "COLLEGE_TRAINING" | "COLLEGE_REGULAR";
  collegeId?: string;
  title: string;
}) {
  const cleanedTitle = cleanTitle(params.title);

  if (params.category === "GLOBAL") {
    return { previewName: cleanedTitle, codePreview: "N/A" };
  }

  if (!params.collegeId) {
    return { previewName: "", codePreview: "" };
  }

  const college = await prisma.college.findUnique({
    where: { id: params.collegeId },
  });
  if (!college) return { previewName: "", codePreview: "" };

  const categoryCode = params.category === "COLLEGE_TRAINING" ? "TR" : "RG";

  const sequenceRecord = await prisma.namingSequence.findUnique({
    where: {
      collegeId_category: {
        collegeId: params.collegeId,
        category: categoryCode,
      },
    },
  });

  const nextNumber = (sequenceRecord?.currentSequence || 0) + 1;
  const codePreview = formatSequenceCode(nextNumber);
  const previewName = `${college.code}-${categoryCode}-${cleanedTitle || "[Title]"}-${codePreview}`;

  return { previewName, codePreview };
}

// ----------------------------------------------------
// 2. Create Examination
// ----------------------------------------------------
export async function createExamAction(params: {
  category: "GLOBAL" | "COLLEGE_TRAINING" | "COLLEGE_REGULAR";
  collegeId?: string;
  title: string;
  testType: "PUBLIC" | "PRIVATE";
  durationMinutes: number;
  totalMarks: number;
  marksCorrect: number;
  marksIncorrect: number;
  startDate?: string;
  endDate?: string;
  attemptPolicy: "UNLIMITED" | "LIMITED";
  maxAttempts?: number;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized.");

  const cleanedTitle = cleanTitle(params.title);
  if (!cleanedTitle) throw new Error("Examination title is mandatory.");

  let generatedName = cleanedTitle;
  let uniqueCode = "000";
  let collegeCode = "";

  const result = await prisma.$transaction(async (tx) => {
    // Generate code transactionally if college exam
    if (params.category !== "GLOBAL") {
      if (!params.collegeId) {
        throw new Error("College selection is mandatory for College examinations.");
      }

      const college = await tx.college.findUnique({
        where: { id: params.collegeId },
      });
      if (!college || college.isArchived) {
        throw new Error("Invalid or archived college selected.");
      }
      collegeCode = college.code;

      const categoryCode = params.category === "COLLEGE_TRAINING" ? "TR" : "RG";

      // Atomically increment the sequence counter
      const seq = await tx.namingSequence.upsert({
        where: {
          collegeId_category: {
            collegeId: params.collegeId,
            category: categoryCode,
          },
        },
        update: {
          currentSequence: { increment: 1 },
        },
        create: {
          collegeId: params.collegeId,
          category: categoryCode,
          currentSequence: 1,
        },
      });

      uniqueCode = formatSequenceCode(seq.currentSequence);
      generatedName = `${collegeCode}-${categoryCode}-${cleanedTitle}-${uniqueCode}`;
    }

    // Verify name uniqueness
    const existingName = await tx.exam.findUnique({
      where: { generatedName },
    });
    if (existingName) {
      throw new Error(`Examination with name "${generatedName}" already exists.`);
    }

    // Internal readable Exam ID
    const examCount = await tx.exam.count();
    const examId = `EXM-${new Date().getFullYear()}-${String(examCount + 1).padStart(4, "0")}`;

    const newExam = await tx.exam.create({
      data: {
        examId,
        category: params.category,
        collegeId: params.collegeId || null,
        title: cleanedTitle,
        generatedName,
        uniqueCode,
        testType: params.testType,
        durationMinutes: params.durationMinutes,
        totalMarks: params.totalMarks,
        marksCorrect: params.marksCorrect,
        marksIncorrect: params.marksIncorrect,
        startDate: params.startDate ? new Date(params.startDate) : null,
        endDate: params.endDate ? new Date(params.endDate) : null,
        attemptPolicy: params.attemptPolicy,
        maxAttempts: params.maxAttempts || null,
        overallStatus: "DRAFT",
        currentVersion: 1,
        createdBy: user.id,
      },
    });

    // Initialize platform status
    await tx.examPlatformStatus.create({
      data: {
        examId: newExam.id,
        testpressStatus: "PENDING",
        lmsStatus: "PENDING",
        testpressUpdatePending: false,
        lmsUpdatePending: false,
      },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        entityType: "EXAMINATION",
        entityId: newExam.id,
        action: "CREATE",
        newValues: JSON.stringify({
          examId,
          generatedName,
          category: params.category,
          title: cleanedTitle,
        }),
        changeDescription: `Registered new examination: ${generatedName} (${examId})`,
        changedBy: user.id,
      },
    });

    return newExam;
  });

  revalidatePath("/examinations");
  revalidatePath("/dashboard");
  return { success: true, exam: result };
}

// ----------------------------------------------------
// 3. Update Examination Metadata
// ----------------------------------------------------
export async function updateExamMetadataAction(params: {
  examId: string;
  title: string;
  testType: "PUBLIC" | "PRIVATE";
  durationMinutes: number;
  totalMarks: number;
  marksCorrect: number;
  marksIncorrect: number;
  startDate?: string;
  endDate?: string;
  attemptPolicy: "UNLIMITED" | "LIMITED";
  maxAttempts?: number;
  changeDescription: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized.");

  if (!params.changeDescription || params.changeDescription.trim().length === 0) {
    throw new Error("A change description is mandatory when updating examination metadata.");
  }

  const exam = await prisma.exam.findUnique({
    where: { id: params.examId },
    include: { platformStatus: true, college: true },
  });
  if (!exam) throw new Error("Examination not found.");

  const cleanedTitle = cleanTitle(params.title);

  // Re-generate name if title changed (PRESERVING existing unique code!)
  let updatedGeneratedName = exam.generatedName;
  if (exam.category === "GLOBAL") {
    updatedGeneratedName = cleanedTitle;
  } else if (exam.college) {
    const categoryCode = exam.category === "COLLEGE_TRAINING" ? "TR" : "RG";
    updatedGeneratedName = `${exam.college.code}-${categoryCode}-${cleanedTitle}-${exam.uniqueCode}`;
  }

  const isCompletedExam = exam.overallStatus === "COMPLETED";

  const updatedExam = await prisma.$transaction(async (tx) => {
    // If exam was previously completed, increment version and flag updates pending!
    const newVersion = isCompletedExam ? exam.currentVersion + 1 : exam.currentVersion;

    const res = await tx.exam.update({
      where: { id: params.examId },
      data: {
        title: cleanedTitle,
        generatedName: updatedGeneratedName,
        testType: params.testType,
        durationMinutes: params.durationMinutes,
        totalMarks: params.totalMarks,
        marksCorrect: params.marksCorrect,
        marksIncorrect: params.marksIncorrect,
        startDate: params.startDate ? new Date(params.startDate) : null,
        endDate: params.endDate ? new Date(params.endDate) : null,
        attemptPolicy: params.attemptPolicy,
        maxAttempts: params.maxAttempts || null,
        currentVersion: newVersion,
      },
    });

    if (isCompletedExam) {
      // Create version record
      await tx.examVersion.create({
        data: {
          examId: exam.id,
          versionNumber: newVersion,
          snapshotData: JSON.stringify({
            title: cleanedTitle,
            generatedName: updatedGeneratedName,
            durationMinutes: params.durationMinutes,
            totalMarks: params.totalMarks,
          }),
          changeDescription: params.changeDescription.trim(),
          changedBy: user.id,
        },
      });

      // Mark external platform updates pending
      await tx.examPlatformStatus.update({
        where: { examId: exam.id },
        data: {
          testpressUpdatePending: true,
          lmsUpdatePending: true,
        },
      });

      await tx.platformUpdateHistory.createMany({
        data: [
          {
            examId: exam.id,
            platform: "TESTPRESS",
            action: "UPDATE_PENDING",
            changeDescription: params.changeDescription.trim(),
            confirmedBy: user.id,
          },
          {
            examId: exam.id,
            platform: "TRUSKILL_LMS",
            action: "UPDATE_PENDING",
            changeDescription: params.changeDescription.trim(),
            confirmedBy: user.id,
          },
        ],
      });
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        entityType: "EXAMINATION",
        entityId: exam.id,
        action: "UPDATE",
        previousValues: JSON.stringify({
          title: exam.title,
          generatedName: exam.generatedName,
          duration: exam.durationMinutes,
        }),
        newValues: JSON.stringify({
          title: cleanedTitle,
          generatedName: updatedGeneratedName,
          duration: params.durationMinutes,
        }),
        changeDescription: params.changeDescription.trim(),
        changedBy: user.id,
      },
    });

    return res;
  });

  revalidatePath(`/examinations/${params.examId}`);
  revalidatePath("/examinations");
  revalidatePath("/dashboard");
  return { success: true, exam: updatedExam };
}

// ----------------------------------------------------
// 4. Save Examination Composition
// ----------------------------------------------------
export interface SectionTopicInput {
  topicId: string;
  questionCount: number;
  level1Easy: number;
  level2Medium: number;
  level3Hard: number;
}

export interface SectionInput {
  id?: string;
  sectionName: string;
  subjectId: string;
  topics: SectionTopicInput[];
}

export async function saveExamCompositionAction(params: {
  examId: string;
  sections: SectionInput[];
  changeDescription: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized.");

  if (!params.changeDescription || params.changeDescription.trim().length === 0) {
    throw new Error("A change description is mandatory for updating composition.");
  }

  // Validate all composition rules per PRD Section 11.8
  for (const sec of params.sections) {
    if (!sec.sectionName.trim()) {
      throw new Error("Each section must have a section name.");
    }
    if (!sec.subjectId) {
      throw new Error(`Section "${sec.sectionName}" must have a selected subject.`);
    }

    const seenTopics = new Set<string>();

    for (const top of sec.topics) {
      if (seenTopics.has(top.topicId)) {
        throw new Error(`Duplicate topic selected in section "${sec.sectionName}".`);
      }
      seenTopics.add(top.topicId);

      if (top.questionCount <= 0) {
        throw new Error(`Topic question counts must be greater than zero.`);
      }

      if (top.level1Easy < 0 || top.level2Medium < 0 || top.level3Hard < 0) {
        throw new Error(`Negative difficulty values are prohibited.`);
      }

      if (top.level1Easy + top.level2Medium + top.level3Hard !== top.questionCount) {
        throw new Error(
          `Difficulty counts (${top.level1Easy} Easy + ${top.level2Medium} Medium + ${top.level3Hard} Hard = ${
            top.level1Easy + top.level2Medium + top.level3Hard
          }) must equal topic question count (${top.questionCount}).`
        );
      }
    }
  }

  const exam = await prisma.exam.findUnique({
    where: { id: params.examId },
    include: { platformStatus: true },
  });
  if (!exam) throw new Error("Examination not found.");

  const isCompletedExam = exam.overallStatus === "COMPLETED";

  await prisma.$transaction(async (tx) => {
    // 1. Delete existing sections & topics (cascades)
    await tx.examSection.deleteMany({
      where: { examId: params.examId },
    });

    // 2. Insert new sections and their topics
    let sectionSort = 0;
    for (const sec of params.sections) {
      sectionSort++;
      const sectionTotalQuestions = sec.topics.reduce((sum, t) => sum + t.questionCount, 0);

      const createdSection = await tx.examSection.create({
        data: {
          examId: params.examId,
          subjectId: sec.subjectId,
          sectionName: sec.sectionName.trim(),
          sortOrder: sectionSort,
        },
      });

      for (const top of sec.topics) {
        const percentage = sectionTotalQuestions > 0 ? (top.questionCount / sectionTotalQuestions) * 100 : 0;
        await tx.examSectionTopic.create({
          data: {
            sectionId: createdSection.id,
            topicId: top.topicId,
            questionCount: top.questionCount,
            level1Easy: top.level1Easy,
            level2Medium: top.level2Medium,
            level3Hard: top.level3Hard,
            compositionPercentage: parseFloat(percentage.toFixed(2)),
          },
        });
      }
    }

    // 3. Update exam status if Draft -> Ready for Testpress
    if (exam.overallStatus === "DRAFT") {
      await tx.exam.update({
        where: { id: params.examId },
        data: { overallStatus: "READY_FOR_TESTPRESS" },
      });
    }

    // 4. If completed exam, increment version and flag pending platform updates
    if (isCompletedExam) {
      const newVersion = exam.currentVersion + 1;
      await tx.exam.update({
        where: { id: params.examId },
        data: { currentVersion: newVersion },
      });

      await tx.examVersion.create({
        data: {
          examId: exam.id,
          versionNumber: newVersion,
          snapshotData: JSON.stringify(params.sections),
          changeDescription: params.changeDescription.trim(),
          changedBy: user.id,
        },
      });

      await tx.examPlatformStatus.update({
        where: { examId: exam.id },
        data: {
          testpressUpdatePending: true,
          lmsUpdatePending: true,
        },
      });

      await tx.platformUpdateHistory.createMany({
        data: [
          {
            examId: exam.id,
            platform: "TESTPRESS",
            action: "UPDATE_PENDING",
            changeDescription: `Composition updated: ${params.changeDescription.trim()}`,
            confirmedBy: user.id,
          },
          {
            examId: exam.id,
            platform: "TRUSKILL_LMS",
            action: "UPDATE_PENDING",
            changeDescription: `Composition updated: ${params.changeDescription.trim()}`,
            confirmedBy: user.id,
          },
        ],
      });
    }

    // 5. Audit Log
    await tx.auditLog.create({
      data: {
        entityType: "EXAMINATION",
        entityId: exam.id,
        action: "UPDATE",
        newValues: JSON.stringify(params.sections),
        changeDescription: params.changeDescription.trim(),
        changedBy: user.id,
      },
    });
  });

  revalidatePath(`/examinations/${params.examId}`);
  revalidatePath("/examinations");
  revalidatePath("/dashboard");
  return { success: true };
}

// ----------------------------------------------------
// 5. Mark Testpress Deployment Status
// ----------------------------------------------------
export async function markTestpressCompletedAction(params: {
  examId: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized.");

  const exam = await prisma.exam.findUnique({
    where: { id: params.examId },
    include: { platformStatus: true },
  });
  if (!exam) throw new Error("Examination not found.");

  await prisma.$transaction(async (tx) => {
    await tx.examPlatformStatus.update({
      where: { examId: params.examId },
      data: {
        testpressStatus: "COMPLETED",
        testpressCompletedAt: new Date(),
        testpressCompletedBy: user.id,
        testpressNotes: params.notes?.trim() || null,
      },
    });

    // If LMS is also already completed (e.g. edge case) overall is COMPLETED, else LMS_PENDING
    const nextOverall = exam.platformStatus?.lmsStatus === "COMPLETED" ? "COMPLETED" : "LMS_PENDING";

    await tx.exam.update({
      where: { id: params.examId },
      data: { overallStatus: nextOverall },
    });

    await tx.auditLog.create({
      data: {
        entityType: "PLATFORM_STATUS",
        entityId: exam.id,
        action: "COMPLETION",
        newValues: JSON.stringify({ testpress: "COMPLETED", notes: params.notes }),
        changeDescription: `Marked Testpress creation completed by ${user.name}`,
        changedBy: user.id,
      },
    });
  });

  revalidatePath(`/examinations/${params.examId}`);
  revalidatePath("/examinations");
  revalidatePath("/dashboard");
  return { success: true };
}

// ----------------------------------------------------
// 6. Mark Truskill LMS Deployment Status
// ----------------------------------------------------
export async function markLmsCompletedAction(params: {
  examId: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized.");

  const exam = await prisma.exam.findUnique({
    where: { id: params.examId },
    include: { platformStatus: true },
  });
  if (!exam) throw new Error("Examination not found.");

  // STRICT RULE from PRD Section 13.5: Truskill LMS completion MUST NOT be marked before Testpress completion!
  if (exam.platformStatus?.testpressStatus !== "COMPLETED") {
    throw new Error("Truskill LMS listing cannot be marked completed before Testpress creation is completed.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.examPlatformStatus.update({
      where: { examId: params.examId },
      data: {
        lmsStatus: "COMPLETED",
        lmsCompletedAt: new Date(),
        lmsCompletedBy: user.id,
        lmsNotes: params.notes?.trim() || null,
      },
    });

    // Both stages now complete -> Overall Status = COMPLETED
    await tx.exam.update({
      where: { id: params.examId },
      data: { overallStatus: "COMPLETED" },
    });

    await tx.auditLog.create({
      data: {
        entityType: "PLATFORM_STATUS",
        entityId: exam.id,
        action: "COMPLETION",
        newValues: JSON.stringify({ truskillLms: "COMPLETED", notes: params.notes }),
        changeDescription: `Marked Truskill LMS listing completed by ${user.name}`,
        changedBy: user.id,
      },
    });
  });

  revalidatePath(`/examinations/${params.examId}`);
  revalidatePath("/examinations");
  revalidatePath("/dashboard");
  return { success: true };
}

// ----------------------------------------------------
// 7. Confirm Subsequent Platform Updates
// ----------------------------------------------------
export async function confirmPlatformUpdateAction(params: {
  examId: string;
  platform: "TESTPRESS" | "TRUSKILL_LMS";
  changeDescription: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized.");

  if (!params.changeDescription || params.changeDescription.trim().length === 0) {
    throw new Error("A description is mandatory when confirming a platform update.");
  }

  await prisma.$transaction(async (tx) => {
    const updateData =
      params.platform === "TESTPRESS"
        ? { testpressUpdatePending: false }
        : { lmsUpdatePending: false };

    await tx.examPlatformStatus.update({
      where: { examId: params.examId },
      data: updateData,
    });

    await tx.platformUpdateHistory.create({
      data: {
        examId: params.examId,
        platform: params.platform,
        action: "UPDATE_CONFIRMED",
        changeDescription: params.changeDescription.trim(),
        confirmedBy: user.id,
      },
    });

    await tx.auditLog.create({
      data: {
        entityType: "PLATFORM_STATUS",
        entityId: params.examId,
        action: "UPDATE",
        changeDescription: `Confirmed ${params.platform === "TESTPRESS" ? "Testpress" : "Truskill LMS"} update: ${params.changeDescription.trim()}`,
        changedBy: user.id,
      },
    });
  });

  revalidatePath(`/examinations/${params.examId}`);
  revalidatePath("/examinations");
  revalidatePath("/dashboard");
  return { success: true };
}
