import { canCompleteProject, canEvaluateCompletedProject, canMutateProgress, canSubmitDeliverable } from "@/modules/application";
import { findProjectForStudentEvaluation, findOwnedProjectWithProgress, updateProjectStatus, withProjectTransaction } from "@/modules/project";
import { createStudentToSmeEvaluation, findProgressByIdWithProject, findStudentProfileByUserId, updateProgressById, updateProgressByProjectId, } from "../repo/progress-repo";
import { MilestoneItem, ProgressUpdateItem, parseMilestones, parseProgressUpdates } from "./parser";
import { err, ok, type Result } from "@/modules/shared";

type ProgressUseCaseErrorCode =
  | "STUDENT_PROFILE_NOT_FOUND"
  | "PROGRESS_FORBIDDEN"
  | "PROGRESS_LOCKED"
  | "PROJECT_MISMATCH"
  | "DELIVERABLE_STATUS_INVALID"
  | "EVALUATION_STATUS_INVALID"
  | "PROJECT_NOT_FOUND"
  | "EVALUATION_EXISTS"
  | "PROJECT_FORBIDDEN"
  | "PROJECT_COMPLETE_INVALID";

type ProgressActionResult = Result<{ projectId: string }, ProgressUseCaseErrorCode>;
type CompleteProjectResult = Result<null, ProgressUseCaseErrorCode>;

async function getOwnedProgressEntry(progressId: string, userId: string) {
  const profile = await findStudentProfileByUserId(userId);

  if (!profile) {
    return err("STUDENT_PROFILE_NOT_FOUND", "Không tìm thấy hồ sơ sinh viên.");
  }

  const progress = await findProgressByIdWithProject(progressId);

  if (!progress || progress.studentId !== profile.id) {
    return err("PROGRESS_FORBIDDEN", "Bạn không có quyền cập nhật tiến độ này.");
  }

  return ok({ profile, progress });
}

export async function addMilestoneForStudent(params: {
  progressId: string;
  userId: string;
  title: string;
}): Promise<ProgressActionResult> {
  const owned = await getOwnedProgressEntry(params.progressId, params.userId);
  if (!owned.ok) {
    return owned;
  }

  if (!canMutateProgress(owned.data.progress.status)) {
    return err("PROGRESS_LOCKED", "Dự án đã khóa cập nhật tiến độ.");
  }

  const milestones = parseMilestones(owned.data.progress.milestones);
  const nextMilestones: MilestoneItem[] = [
    ...milestones,
    {
      id: crypto.randomUUID(),
      title: params.title,
      createdAt: new Date().toISOString(),
    },
  ];

  await updateProgressById(params.progressId, {
    milestones: nextMilestones,
    status: owned.data.progress.status === "NOT_STARTED" ? "IN_PROGRESS" : owned.data.progress.status,
  });

  return ok({ projectId: owned.data.progress.projectId });
}

export async function addProgressUpdateForStudent(params: {
  progressId: string;
  userId: string;
  content: string;
}): Promise<ProgressActionResult> {
  const owned = await getOwnedProgressEntry(params.progressId, params.userId);
  if (!owned.ok) {
    return owned;
  }

  if (!canMutateProgress(owned.data.progress.status)) {
    return err("PROGRESS_LOCKED", "Dự án đã khóa cập nhật tiến độ.");
  }

  const updates = parseProgressUpdates(owned.data.progress.updates);
  const nextUpdates: ProgressUpdateItem[] = [
    ...updates,
    {
      id: crypto.randomUUID(),
      content: params.content,
      createdAt: new Date().toISOString(),
    },
  ];

  await updateProgressById(params.progressId, {
    updates: nextUpdates,
    status: owned.data.progress.status === "NOT_STARTED" ? "IN_PROGRESS" : owned.data.progress.status,
  });

  return ok({ projectId: owned.data.progress.projectId });
}

export async function submitDeliverableForStudent(params: {
  progressId: string;
  projectId: string;
  userId: string;
  deliverableUrl: string;
}): Promise<ProgressActionResult> {
  const owned = await getOwnedProgressEntry(params.progressId, params.userId);
  if (!owned.ok) {
    return owned;
  }

  if (owned.data.progress.projectId !== params.projectId) {
    return err("PROJECT_MISMATCH", "Dữ liệu dự án không hợp lệ.");
  }

  if (!canSubmitDeliverable(owned.data.progress.status)) {
    return err("DELIVERABLE_STATUS_INVALID", "Dự án đã được bàn giao hoặc hoàn thành.");
  }

  await withProjectTransaction(async (tx) => {
    await updateProgressById(
      params.progressId,
      {
        deliverableUrl: params.deliverableUrl,
        status: "SUBMITTED",
      },
      tx,
    );

    await updateProjectStatus(params.projectId, "SUBMITTED", tx);
  });

  return ok({ projectId: params.projectId });
}

export async function submitSmeEvaluationByStudent(params: {
  progressId: string;
  projectId: string;
  userId: string;
  outputQuality: number;
  onTime: number;
  proactiveness: number;
  communication: number;
  overallFit: number;
  comment: string;
}): Promise<ProgressActionResult> {
  const owned = await getOwnedProgressEntry(params.progressId, params.userId);
  if (!owned.ok) {
    return owned;
  }

  if (owned.data.progress.projectId !== params.projectId) {
    return err("PROJECT_MISMATCH", "Dữ liệu dự án không hợp lệ.");
  }

  if (
    !canEvaluateCompletedProject({
      projectStatus: owned.data.progress.project.status,
      progressStatus: owned.data.progress.status,
    })
  ) {
    return err("EVALUATION_STATUS_INVALID", "Chỉ có thể đánh giá khi dự án đã hoàn thành.");
  }

  const project = await findProjectForStudentEvaluation(params.projectId, params.userId);

  if (!project) {
    return err("PROJECT_NOT_FOUND", "Không tìm thấy dự án.");
  }

  if (project.evaluations.length > 0) {
    return err("EVALUATION_EXISTS", "Bạn đã đánh giá doanh nghiệp cho dự án này.");
  }

  await createStudentToSmeEvaluation({
    projectId: params.projectId,
    evaluatorId: params.userId,
    evaluateeId: project.sme.userId,
    type: "STUDENT_TO_SME",
    outputQuality: params.outputQuality,
    onTime: params.onTime,
    proactiveness: params.proactiveness,
    communication: params.communication,
    overallFit: params.overallFit,
    comment: params.comment || null,
  });

  return ok({ projectId: params.projectId });
}

export async function markProjectCompletedBySme(params: {
  projectId: string;
  userId: string;
}): Promise<CompleteProjectResult> {
  const ownedProject = await findOwnedProjectWithProgress(params.projectId);

  if (!ownedProject || ownedProject.sme.userId !== params.userId) {
    return err("PROJECT_FORBIDDEN", "Bạn không có quyền nghiệm thu dự án này.");
  }

  if (
    !canCompleteProject({
      projectStatus: ownedProject.status,
      progressStatus: ownedProject.progress?.status,
      hasDeliverableUrl: Boolean(ownedProject.progress?.deliverableUrl),
    })
  ) {
    return err("PROJECT_COMPLETE_INVALID", "Dự án chưa ở trạng thái chờ nghiệm thu hoặc chưa có link bàn giao.");
  }

  await withProjectTransaction(async (tx) => {
    await updateProjectStatus(params.projectId, "COMPLETED", tx);
    await updateProgressByProjectId(
      params.projectId,
      { status: "COMPLETED" },
      tx,
    );
  });

  return ok(null);
}
