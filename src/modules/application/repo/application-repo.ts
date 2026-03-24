import { Prisma } from "@prisma/client";
import { prisma } from "@/modules/shared";

type Tx = Prisma.TransactionClient;

type DbClient = typeof prisma | Tx;

function db(tx?: Tx): DbClient {
  return tx ?? prisma;
}

export async function withApplicationTransaction<T>(run: (tx: Tx) => Promise<T>) {
  return prisma.$transaction(run);
}

export async function findStudentProfileByUserId(userId: string) {
  return prisma.studentProfile.findUnique({
    where: { userId },
  });
}

export async function findProjectSummaryById(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      status: true,
      deadline: true,
    },
  });
}

export async function findProjectWithSmeById(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: { sme: true },
  });
}

export async function findApplicationStatusByProjectAndStudent(projectId: string, studentId: string) {
  return prisma.application.findUnique({
    where: {
      projectId_studentId: {
        projectId,
        studentId,
      },
    },
    select: {
      id: true,
      status: true,
      initiatedBy: true,
    },
  });
}

export async function findApplicationWithProjectByProjectAndStudent(projectId: string, studentId: string) {
  return prisma.application.findUnique({
    where: {
      projectId_studentId: { projectId, studentId },
    },
    include: {
      project: {
        select: {
          id: true,
          status: true,
          deadline: true,
        },
      },
    },
  });
}

export async function createApplication(
  data: Prisma.ApplicationUncheckedCreateInput,
  tx?: Tx,
) {
  return db(tx).application.create({ data });
}

export async function updateApplicationMany(
  args: Prisma.ApplicationUpdateManyArgs,
  tx?: Tx,
) {
  return db(tx).application.updateMany(args);
}
