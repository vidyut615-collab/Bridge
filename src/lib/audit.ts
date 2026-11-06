import { prisma } from "./prisma";

export type AuditEntityType = "QUESTION_BANK" | "MASTER_DATA" | "EXAM" | "MASTER_COLLEGE" | "MASTER_SUBJECT" | "MASTER_TOPIC" | "DEPLOYMENT" | "EXAMINATION" | "PLATFORM_STATUS";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "RENAME"
  | "ARCHIVE"
  | "RESTORE"
  | "COMPLETION"
  | "VERSION_INCREMENT"
  | "DELETE";

export interface AuditLogParams {
  entityType: AuditEntityType | string;
  entityId: string;
  action: AuditAction | string;
  previousValues?: unknown;
  prevValue?: unknown;
  newValues?: unknown;
  newValue?: unknown;
  changeDescription: string;
  changedBy?: string;
  userId?: string;
}

export async function recordAuditLog(params: AuditLogParams) {
  if (!params.changeDescription || params.changeDescription.trim().length === 0) {
    throw new Error("A change description is mandatory for all modifications.");
  }

  const prev = params.previousValues ?? params.prevValue;
  const next = params.newValues ?? params.newValue;
  const user = params.changedBy ?? params.userId;

  if (!user) {
    throw new Error("User identifier is required for audit recording.");
  }

  return await prisma.auditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      previousValues: prev !== undefined ? JSON.stringify(prev) : null,
      newValues: next !== undefined ? JSON.stringify(next) : null,
      changeDescription: params.changeDescription.trim(),
      changedBy: user,
    },
  });
}
