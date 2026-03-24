import { Prisma } from "@prisma/client";
import { prisma } from "@/modules/shared";

type Tx = Prisma.TransactionClient;

type DbClient = typeof prisma | Tx;

function db(tx?: Tx): DbClient {
  return tx ?? prisma;
}

export async function findStudentProfileByUserId(userId: string, tx?: Tx) {
  return db(tx).studentProfile.findUnique({
    where: { userId },
  });
}

export async function findProgressByIdWithProject(progressId: string, tx?: Tx) {
  return db(tx).projectProgress.findUnique({
    where: { id: progressId },
    include: { project: true },
  });
}

export async function updateProgressById(
  progressId: string,
  data: Prisma.ProjectProgressUncheckedUpdateInput,
  tx?: Tx,
) {
  return db(tx).projectProgress.update({
    where: { id: progressId },
    data,
  });
}

export async function updateProgressByProjectId(
  projectId: string,
  data: Prisma.ProjectProgressUncheckedUpdateInput,
  tx?: Tx,
) {
  return db(tx).projectProgress.update({
    where: { projectId },
    data,
  });
}

export async function createStudentToSmeEvaluation(
  data: Prisma.EvaluationUncheckedCreateInput,
  tx?: Tx,
) {
  return db(tx).evaluation.create({ data });
}
