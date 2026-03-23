import { Prisma } from "@prisma/client";

export const DEFAULT_DEADLINE_MS = 30 * 24 * 60 * 60 * 1000;

export class LifecycleConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LifecycleConflictError";
  }
}

function assertExactlyOneUpdated(count: number, message: string) {
  if (count !== 1) {
    throw new LifecycleConflictError(message);
  }
}

export async function applyAcceptanceBySme(
  tx: Prisma.TransactionClient,
  params: {
    projectId: string;
    studentId: string;
    deadline: Date;
  },
) {
  const acceptedResult = await tx.application.updateMany({
    where: {
      projectId: params.projectId,
      studentId: params.studentId,
      status: "PENDING",
    },
    data: { status: "ACCEPTED" },
  });

  assertExactlyOneUpdated(
    acceptedResult.count,
    "Ứng viên không còn ở trạng thái chờ duyệt hoặc đã có thay đổi đồng thời.",
  );

  await tx.application.updateMany({
    where: {
      projectId: params.projectId,
      studentId: { not: params.studentId },
      status: { in: ["PENDING", "INVITED"] },
    },
    data: { status: "REJECTED" },
  });

  await tx.projectProgress.upsert({
    where: { projectId: params.projectId },
    create: {
      projectId: params.projectId,
      studentId: params.studentId,
      status: "NOT_STARTED",
      deadline: params.deadline,
    },
    update: {
      studentId: params.studentId,
      deadline: params.deadline,
    },
  });

  const projectUpdated = await tx.project.updateMany({
    where: {
      id: params.projectId,
      status: "OPEN",
    },
    data: { status: "IN_PROGRESS" },
  });

  assertExactlyOneUpdated(
    projectUpdated.count,
    "Dự án không còn ở trạng thái OPEN hoặc đã có thay đổi đồng thời.",
  );
}

export async function rejectPendingCandidateBySme(
  tx: Prisma.TransactionClient,
  params: {
    projectId: string;
    studentId: string;
  },
) {
  const rejectedResult = await tx.application.updateMany({
    where: {
      projectId: params.projectId,
      studentId: params.studentId,
      status: "PENDING",
    },
    data: { status: "REJECTED" },
  });

  assertExactlyOneUpdated(
    rejectedResult.count,
    "Hồ sơ không còn ở trạng thái chờ duyệt hoặc đã có thay đổi đồng thời.",
  );
}

export async function applyInvitationAcceptanceByStudent(
  tx: Prisma.TransactionClient,
  params: {
    applicationId: string;
    projectId: string;
    studentId: string;
    deadline: Date;
  },
) {
  const acceptedResult = await tx.application.updateMany({
    where: {
      id: params.applicationId,
      status: "INVITED",
      initiatedBy: "SME",
    },
    data: { status: "ACCEPTED" },
  });

  assertExactlyOneUpdated(
    acceptedResult.count,
    "Lời mời không còn hợp lệ hoặc đã có thay đổi đồng thời.",
  );

  await tx.application.updateMany({
    where: {
      projectId: params.projectId,
      studentId: { not: params.studentId },
      status: { in: ["PENDING", "INVITED"] },
    },
    data: { status: "REJECTED" },
  });

  await tx.projectProgress.upsert({
    where: { projectId: params.projectId },
    create: {
      projectId: params.projectId,
      studentId: params.studentId,
      status: "NOT_STARTED",
      deadline: params.deadline,
    },
    update: {
      studentId: params.studentId,
      deadline: params.deadline,
    },
  });

  const projectUpdated = await tx.project.updateMany({
    where: {
      id: params.projectId,
      status: "OPEN",
    },
    data: { status: "IN_PROGRESS" },
  });

  assertExactlyOneUpdated(
    projectUpdated.count,
    "Dự án không còn ở trạng thái OPEN hoặc đã có thay đổi đồng thời.",
  );
}

export async function rejectInvitationByStudent(
  tx: Prisma.TransactionClient,
  params: {
    applicationId: string;
  },
) {
  const rejectedResult = await tx.application.updateMany({
    where: {
      id: params.applicationId,
      status: "INVITED",
      initiatedBy: "SME",
    },
    data: { status: "REJECTED" },
  });

  assertExactlyOneUpdated(
    rejectedResult.count,
    "Lời mời không còn hợp lệ hoặc đã có thay đổi đồng thời.",
  );
}
