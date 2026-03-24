import { Prisma, ProjectStatus } from "@prisma/client";
import { prisma } from "@/modules/shared";

type Tx = Prisma.TransactionClient;

type DbClient = typeof prisma | Tx;

function db(tx?: Tx): DbClient {
  return tx ?? prisma;
}

export async function withProjectTransaction<T>(run: (tx: Tx) => Promise<T>) {
  return prisma.$transaction(run);
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
  tx?: Tx,
) {
  return db(tx).project.update({
    where: { id: projectId },
    data: { status },
  });
}

export async function findProjectForStudentEvaluation(projectId: string, evaluatorId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      sme: true,
      evaluations: {
        where: {
          type: "STUDENT_TO_SME",
          evaluatorId,
        },
        select: { id: true },
        take: 1,
      },
    },
  });
}

export async function findOwnedProjectWithProgress(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      sme: true,
      progress: true,
    },
  });
}
