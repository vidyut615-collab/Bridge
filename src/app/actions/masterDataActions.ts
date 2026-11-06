"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// Helper to assert Superadmin role
async function assertSuperadmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") {
    throw new Error("Access denied: Only Superadmin can perform master data modifications.");
  }
  return user;
}

// ----------------------------------------------------
// 1. College Master
// ----------------------------------------------------
export async function createCollegeAction(formData: FormData) {
  const superadmin = await assertSuperadmin();
  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("code") as string)?.trim().toUpperCase();

  if (!name || !code) {
    throw new Error("College name and unique code are required.");
  }

  const existing = await prisma.college.findUnique({ where: { code } });
  if (existing) {
    throw new Error(`College code "${code}" already exists.`);
  }

  const college = await prisma.$transaction(async (tx) => {
    const col = await tx.college.create({
      data: {
        name,
        code,
        createdBy: superadmin.id,
      },
    });

    // Initialize naming sequences for Training (TR) and Regular (RG)
    await tx.namingSequence.createMany({
      data: [
        { collegeId: col.id, category: "TR", currentSequence: 0 },
        { collegeId: col.id, category: "RG", currentSequence: 0 },
      ],
    });

    await tx.auditLog.create({
      data: {
        entityType: "MASTER_DATA",
        entityId: col.id,
        action: "CREATE",
        newValues: JSON.stringify({ name, code }),
        changeDescription: `Created college master record: ${name} (${code})`,
        changedBy: superadmin.id,
      },
    });

    return col;
  });

  revalidatePath("/master-data");
  return { success: true, college };
}

export async function updateCollegeAction(params: {
  id: string;
  name: string;
  code: string;
  changeDescription: string;
}) {
  const superadmin = await assertSuperadmin();
  if (!params.changeDescription || params.changeDescription.trim().length === 0) {
    throw new Error("Change description is mandatory.");
  }

  const prev = await prisma.college.findUnique({ where: { id: params.id } });
  if (!prev) throw new Error("College not found.");

  const updated = await prisma.$transaction(async (tx) => {
    const col = await tx.college.update({
      where: { id: params.id },
      data: {
        name: params.name.trim(),
        code: params.code.trim().toUpperCase(),
      },
    });

    await tx.auditLog.create({
      data: {
        entityType: "MASTER_DATA",
        entityId: col.id,
        action: "UPDATE",
        previousValues: JSON.stringify({ name: prev.name, code: prev.code }),
        newValues: JSON.stringify({ name: col.name, code: col.code }),
        changeDescription: params.changeDescription.trim(),
        changedBy: superadmin.id,
      },
    });

    return col;
  });

  revalidatePath("/master-data");
  return { success: true, college: updated };
}

export async function toggleArchiveCollegeAction(id: string, changeDescription: string) {
  const superadmin = await assertSuperadmin();
  if (!changeDescription || changeDescription.trim().length === 0) {
    throw new Error("Change description is mandatory.");
  }

  const prev = await prisma.college.findUnique({ where: { id } });
  if (!prev) throw new Error("College not found.");

  const nextState = !prev.isArchived;

  await prisma.$transaction(async (tx) => {
    await tx.college.update({
      where: { id },
      data: { isArchived: nextState },
    });

    await tx.auditLog.create({
      data: {
        entityType: "MASTER_DATA",
        entityId: id,
        action: nextState ? "ARCHIVE" : "RESTORE",
        previousValues: JSON.stringify({ isArchived: prev.isArchived }),
        newValues: JSON.stringify({ isArchived: nextState }),
        changeDescription: changeDescription.trim(),
        changedBy: superadmin.id,
      },
    });
  });

  revalidatePath("/master-data");
  return { success: true };
}

// ----------------------------------------------------
// 2. Subject Master
// ----------------------------------------------------
export async function createSubjectAction(formData: FormData) {
  const superadmin = await assertSuperadmin();
  const name = (formData.get("name") as string)?.trim();

  if (!name) throw new Error("Subject name is required.");

  const existing = await prisma.subject.findUnique({ where: { name } });
  if (existing) throw new Error(`Subject "${name}" already exists.`);

  const subject = await prisma.$transaction(async (tx) => {
    const sub = await tx.subject.create({
      data: {
        name,
        createdBy: superadmin.id,
      },
    });

    await tx.auditLog.create({
      data: {
        entityType: "MASTER_DATA",
        entityId: sub.id,
        action: "CREATE",
        newValues: JSON.stringify({ name }),
        changeDescription: `Created master subject: ${name}`,
        changedBy: superadmin.id,
      },
    });

    return sub;
  });

  revalidatePath("/master-data");
  revalidatePath("/question-bank");
  return { success: true, subject };
}

export async function renameSubjectAction(params: {
  id: string;
  name: string;
  changeDescription: string;
}) {
  const superadmin = await assertSuperadmin();
  if (!params.changeDescription || params.changeDescription.trim().length === 0) {
    throw new Error("Change description is mandatory.");
  }

  const prev = await prisma.subject.findUnique({ where: { id: params.id } });
  if (!prev) throw new Error("Subject not found.");

  const updated = await prisma.$transaction(async (tx) => {
    const sub = await tx.subject.update({
      where: { id: params.id },
      data: { name: params.name.trim() },
    });

    await tx.auditLog.create({
      data: {
        entityType: "MASTER_DATA",
        entityId: sub.id,
        action: "RENAME",
        previousValues: JSON.stringify({ name: prev.name }),
        newValues: JSON.stringify({ name: sub.name }),
        changeDescription: params.changeDescription.trim(),
        changedBy: superadmin.id,
      },
    });

    return sub;
  });

  revalidatePath("/master-data");
  revalidatePath("/question-bank");
  return { success: true, subject: updated };
}

export async function toggleArchiveSubjectAction(id: string, changeDescription: string) {
  const superadmin = await assertSuperadmin();
  if (!changeDescription || changeDescription.trim().length === 0) {
    throw new Error("Change description is mandatory.");
  }

  const prev = await prisma.subject.findUnique({ where: { id } });
  if (!prev) throw new Error("Subject not found.");

  const nextState = !prev.isArchived;

  await prisma.$transaction(async (tx) => {
    await tx.subject.update({
      where: { id },
      data: { isArchived: nextState },
    });

    await tx.auditLog.create({
      data: {
        entityType: "MASTER_DATA",
        entityId: id,
        action: nextState ? "ARCHIVE" : "RESTORE",
        previousValues: JSON.stringify({ isArchived: prev.isArchived }),
        newValues: JSON.stringify({ isArchived: nextState }),
        changeDescription: changeDescription.trim(),
        changedBy: superadmin.id,
      },
    });
  });

  revalidatePath("/master-data");
  revalidatePath("/question-bank");
  return { success: true };
}

// ----------------------------------------------------
// 3. Topic Master
// ----------------------------------------------------
export async function createTopicAction(formData: FormData) {
  const superadmin = await assertSuperadmin();
  const subjectId = formData.get("subjectId") as string;
  const name = (formData.get("name") as string)?.trim();

  if (!subjectId || !name) {
    throw new Error("Subject and Topic name are required.");
  }

  const existing = await prisma.topic.findFirst({
    where: { subjectId, name },
  });
  if (existing) {
    throw new Error(`Topic "${name}" already exists under this subject.`);
  }

  // Count topics to generate next topicCode
  const totalTopics = await prisma.topic.count();
  const topicCode = `TOP-${String(totalTopics + 1).padStart(5, "0")}`;

  const topic = await prisma.$transaction(async (tx) => {
    const top = await tx.topic.create({
      data: {
        topicCode,
        subjectId,
        name,
        createdBy: superadmin.id,
      },
    });

    await tx.auditLog.create({
      data: {
        entityType: "MASTER_DATA",
        entityId: top.id,
        action: "CREATE",
        newValues: JSON.stringify({ topicCode, name, subjectId }),
        changeDescription: `Created master topic: ${name} (${topicCode})`,
        changedBy: superadmin.id,
      },
    });

    return top;
  });

  revalidatePath("/master-data");
  return { success: true, topic };
}

export async function renameTopicAction(params: {
  id: string;
  name: string;
  changeDescription: string;
}) {
  const superadmin = await assertSuperadmin();
  if (!params.changeDescription || params.changeDescription.trim().length === 0) {
    throw new Error("Change description is mandatory.");
  }

  const prev = await prisma.topic.findUnique({ where: { id: params.id } });
  if (!prev) throw new Error("Topic not found.");

  const updated = await prisma.$transaction(async (tx) => {
    const top = await tx.topic.update({
      where: { id: params.id },
      data: { name: params.name.trim() },
    });

    await tx.auditLog.create({
      data: {
        entityType: "MASTER_DATA",
        entityId: top.id,
        action: "RENAME",
        previousValues: JSON.stringify({ name: prev.name }),
        newValues: JSON.stringify({ name: top.name }),
        changeDescription: params.changeDescription.trim(),
        changedBy: superadmin.id,
      },
    });

    return top;
  });

  revalidatePath("/master-data");
  return { success: true, topic: updated };
}

export async function toggleArchiveTopicAction(id: string, changeDescription: string) {
  const superadmin = await assertSuperadmin();
  if (!changeDescription || changeDescription.trim().length === 0) {
    throw new Error("Change description is mandatory.");
  }

  const prev = await prisma.topic.findUnique({ where: { id } });
  if (!prev) throw new Error("Topic not found.");

  const nextState = !prev.isArchived;

  await prisma.$transaction(async (tx) => {
    await tx.topic.update({
      where: { id },
      data: { isArchived: nextState },
    });

    await tx.auditLog.create({
      data: {
        entityType: "MASTER_DATA",
        entityId: id,
        action: nextState ? "ARCHIVE" : "RESTORE",
        previousValues: JSON.stringify({ isArchived: prev.isArchived }),
        newValues: JSON.stringify({ isArchived: nextState }),
        changeDescription: changeDescription.trim(),
        changedBy: superadmin.id,
      },
    });
  });

  revalidatePath("/master-data");
  return { success: true };
}

// ----------------------------------------------------
// 4. User Management (Superadmin only)
// ----------------------------------------------------
export async function createUserAction(formData: FormData) {
  const superadmin = await assertSuperadmin();
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "STAFF";

  if (!name || !email || !password) {
    throw new Error("Name, email and password are required.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error(`User with email "${email}" already exists.`);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role === "SUPERADMIN" ? "SUPERADMIN" : "STAFF",
    },
  });

  await recordAuditLog({
    entityType: "MASTER_DATA",
    entityId: newUser.id,
    action: "CREATE",
    newValues: { email, name, role },
    changeDescription: `Created user account for ${name} (${role})`,
    changedBy: superadmin.id,
  });

  revalidatePath("/master-data");
  return { success: true, userId: newUser.id };
}
