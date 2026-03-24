"use server";

import { revalidatePath } from "next/cache";
import { getSessionUserIdByRole } from "@/modules/auth";
import { DEFAULT_DEADLINE_MS, LifecycleConflictError, applyAcceptanceBySme, applyInvitationAcceptanceByStudent, rejectInvitationByStudent, rejectPendingCandidateBySme, } from "../services/application-lifecycle";
import { createApplication, findApplicationStatusByProjectAndStudent, findApplicationWithProjectByProjectAndStudent, findProjectSummaryById, findProjectWithSmeById, findStudentProfileByUserId, withApplicationTransaction, } from "../repo/application-repo";
import { canAcceptCandidateStatus, canAcceptInvitation, canProjectAcceptCandidates } from "../model/lifecycle-rules";
import { applicationActionErrorMessage, type ApplicationActionErrorCode } from "../types/application-action-errors";
import { err, ok, type Result } from "@/modules/shared";

type ApplicationActionResult = Result<null, ApplicationActionErrorCode>;

function success(): ApplicationActionResult {
  return ok(null);
}

function failure(code: ApplicationActionErrorCode, overrideMessage?: string): ApplicationActionResult {
  return err(code, overrideMessage ?? applicationActionErrorMessage(code));
}

async function getAuthorizedUserIdByRole(role: "SME" | "STUDENT") {
  const { auth } = await import("@/auth");
  const session = await auth();
  return getSessionUserIdByRole(session, role);
}

export async function applyProject(projectId: string, matchScore: number): Promise<ApplicationActionResult> {
  try {
    const studentUserId = await getAuthorizedUserIdByRole("STUDENT");

    if (!studentUserId) {
      return failure("UNAUTHORIZED");
    }

    const profile = await findStudentProfileByUserId(studentUserId);

    if (!profile) {
      return failure("STUDENT_PROFILE_NOT_FOUND");
    }

    const project = await findProjectSummaryById(projectId);

    if (!project) {
      return failure("PROJECT_NOT_FOUND");
    }

    if (!canProjectAcceptCandidates(project.status)) {
      return failure("PROJECT_CLOSED");
    }

    const existingApplication = await findApplicationStatusByProjectAndStudent(projectId, profile.id);

    if (existingApplication) {
      if (existingApplication.status === "PENDING") {
        return failure("ALREADY_APPLIED");
      }

      if (existingApplication.status === "ACCEPTED") {
        return failure("ALREADY_ACCEPTED");
      }

      return failure("APPLICATION_ALREADY_REJECTED");
    }

    const safeMatchScore = Number.isFinite(matchScore)
      ? Math.max(0, Math.min(100, Math.round(matchScore)))
      : 0;

    await createApplication({
      projectId,
      studentId: profile.id,
      status: "PENDING",
      matchScore: safeMatchScore,
    });

    revalidatePath("/student/projects");
    return success();
  } catch (error) {
    console.error("applyProject error:", error);
    return failure("INTERNAL_ERROR", "Không thể ứng tuyển lúc này. Vui lòng thử lại.");
  }
}

export async function updateCandidateStatus(
  projectId: string,
  studentId: string,
  status: "ACCEPTED" | "REJECTED",
): Promise<ApplicationActionResult> {
  try {
    const smeUserId = await getAuthorizedUserIdByRole("SME");

    if (!smeUserId) {
      return failure("UNAUTHORIZED");
    }

    const project = await findProjectWithSmeById(projectId);

    if (!project) {
      return failure("PROJECT_NOT_FOUND");
    }

    if (project.sme.userId !== smeUserId) {
      return failure("PROJECT_NOT_OWNED");
    }

    if (!canProjectAcceptCandidates(project.status)) {
      return failure("PROJECT_STATUS_LOCKED");
    }

    const application = await findApplicationStatusByProjectAndStudent(projectId, studentId);

    if (!application) {
      return failure("APPLICATION_NOT_FOUND");
    }

    if (!canAcceptCandidateStatus(application.status)) {
      if (application.status === "ACCEPTED") {
        return failure("CANDIDATE_ALREADY_ACCEPTED");
      }

      return failure("CANDIDATE_ALREADY_REJECTED");
    }

    const deadline = project.deadline ?? new Date(Date.now() + DEFAULT_DEADLINE_MS);

    await withApplicationTransaction(async (tx) => {
      if (status === "ACCEPTED") {
        await applyAcceptanceBySme(tx, {
          projectId,
          studentId,
          deadline,
        });
        return;
      }

      await rejectPendingCandidateBySme(tx, {
        projectId,
        studentId,
      });
    });

    revalidatePath(`/sme/projects/${projectId}/candidates`);
    revalidatePath(`/sme/projects/${projectId}`);
    revalidatePath("/sme/projects");
    revalidatePath("/student/projects");
    revalidatePath("/student/my-projects");
    return success();
  } catch (error) {
    if (error instanceof LifecycleConflictError) {
      return failure("CONFLICT", error.message);
    }

    console.error("updateCandidateStatus error:", error);
    return failure("INTERNAL_ERROR", "Không thể cập nhật trạng thái ứng viên. Vui lòng thử lại.");
  }
}

export async function inviteStudent(projectId: string, studentId: string): Promise<ApplicationActionResult> {
  try {
    const smeUserId = await getAuthorizedUserIdByRole("SME");

    if (!smeUserId) {
      return failure("UNAUTHORIZED");
    }

    const project = await findProjectWithSmeById(projectId);

    if (!project || project.sme.userId !== smeUserId) {
      return failure("PROJECT_NOT_FOUND_OR_FORBIDDEN");
    }

    if (!canProjectAcceptCandidates(project.status)) {
      return failure("PROJECT_NOT_RECRUITING");
    }

    const existingApplication = await findApplicationStatusByProjectAndStudent(projectId, studentId);

    if (existingApplication) {
      return failure("ALREADY_HAS_INTERACTION");
    }

    await createApplication({
      projectId,
      studentId,
      status: "INVITED",
      initiatedBy: "SME",
    });

    revalidatePath("/sme/students");
    return success();
  } catch (error) {
    console.error("inviteStudent error:", error);
    return failure("INTERNAL_ERROR", "Có lỗi xảy ra khi gửi lời mời.");
  }
}

export async function respondToInvitation(
  projectId: string,
  status: "ACCEPTED" | "REJECTED",
): Promise<ApplicationActionResult> {
  try {
    const studentUserId = await getAuthorizedUserIdByRole("STUDENT");

    if (!studentUserId) {
      return failure("UNAUTHORIZED");
    }

    const profile = await findStudentProfileByUserId(studentUserId);

    if (!profile) {
      return failure("STUDENT_PROFILE_NOT_FOUND", "Không tìm thấy hồ sơ của bạn.");
    }

    const application = await findApplicationWithProjectByProjectAndStudent(projectId, profile.id);

    if (
      !application ||
      !canAcceptInvitation({
        status: application.status,
        initiatedBy: application.initiatedBy,
      })
    ) {
      return failure("INVITATION_NOT_FOUND");
    }

    if (!canProjectAcceptCandidates(application.project.status)) {
      return failure("PROJECT_ALREADY_ASSIGNED");
    }

    const deadline = application.project.deadline ?? new Date(Date.now() + DEFAULT_DEADLINE_MS);

    await withApplicationTransaction(async (tx) => {
      if (status === "ACCEPTED") {
        await applyInvitationAcceptanceByStudent(tx, {
          applicationId: application.id,
          projectId,
          studentId: profile.id,
          deadline,
        });
        return;
      }

      await rejectInvitationByStudent(tx, {
        applicationId: application.id,
      });
    });

    revalidatePath("/student/dashboard");
    revalidatePath("/student/projects");
    return success();
  } catch (error) {
    if (error instanceof LifecycleConflictError) {
      return failure("CONFLICT", error.message);
    }

    console.error("respondToInvitation error:", error);
    return failure("INTERNAL_ERROR", "Không thể phản hồi lúc này.");
  }
}
