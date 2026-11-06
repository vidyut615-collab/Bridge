import { prisma } from "./prisma";

export type AuditEntityType = "QUESTION_BANK" | "MASTER_DATA" | "EXAMINATION" | "PLATFORM_STATUS";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "RENAME"
  | "ARCHIVE"
  | "RESTORE"
  | "COMPLETION"
  | "VERSION_INCREMENT"
  | "DELETE";

interface AuditLogParams {
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  prevValue?: unknown;
  newValue?: unknown;
  changeDescription: string;
  changedBy: string;
}

export async function recordAuditLog(params: AuditLogParams) {
  if (!params.changeDescription || params.changeDescription.trim().length === 0) {
    throw new Error("A change description is mandatory for all modifications.");
  }

  return await prisma.auditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      prevValue: params.prevValue !== undefined ? JSON.stringify(params.prevValue) : null,
      newValue: params.newValue !== undefined ? JSON.stringify(params.newValue) : null,
      changeDescription: params.changeDescription.trim(),
      changedBy: params.changedBy,
    },
  });
}
