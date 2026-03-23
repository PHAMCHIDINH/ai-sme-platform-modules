import { beforeEach, describe, expect, it, vi } from "vitest";

const progressRepoMock = vi.hoisted(() => ({
  studentProfileFindUnique: vi.fn(),
  projectProgressFindUnique: vi.fn(),
  projectProgressUpdate: vi.fn(),
  updateProgressByProjectId: vi.fn(),
  createStudentToSmeEvaluation: vi.fn(),
}));

const projectRepoMock = vi.hoisted(() => ({
  projectFindUnique: vi.fn(),
  updateProjectStatus: vi.fn(),
  withProjectTransaction: vi.fn(),
}));

vi.mock("../repo/progress-repo", () => ({
  findStudentProfileByUserId: progressRepoMock.studentProfileFindUnique,
  findProgressByIdWithProject: progressRepoMock.projectProgressFindUnique,
  updateProgressById: progressRepoMock.projectProgressUpdate,
  updateProgressByProjectId: progressRepoMock.updateProgressByProjectId,
  createStudentToSmeEvaluation: progressRepoMock.createStudentToSmeEvaluation,
}));

vi.mock("@/modules/project/repo/project-repo", () => ({
  findProjectForStudentEvaluation: projectRepoMock.projectFindUnique,
  findOwnedProjectWithProgress: projectRepoMock.projectFindUnique,
  updateProjectStatus: projectRepoMock.updateProjectStatus,
  withProjectTransaction: projectRepoMock.withProjectTransaction,
}));

import { addMilestoneForStudent, markProjectCompletedBySme } from "./use-cases";

describe("progress use-cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectRepoMock.withProjectTransaction.mockImplementation(async (run: (tx: unknown) => Promise<unknown>) => run({}));
  });

  it("blocks milestone update when progress is immutable", async () => {
    progressRepoMock.studentProfileFindUnique.mockResolvedValue({ id: "student-1" });
    progressRepoMock.projectProgressFindUnique.mockResolvedValue({
      id: "progress-1",
      studentId: "student-1",
      projectId: "project-1",
      status: "COMPLETED",
      milestones: [],
      updates: [],
      project: { status: "COMPLETED" },
    });

    const result = await addMilestoneForStudent({
      progressId: "progress-1",
      userId: "user-1",
      title: "New milestone",
    });

    expect(result).toEqual({
      ok: false,
      code: "PROGRESS_LOCKED",
      error: "Dự án đã khóa cập nhật tiến độ.",
    });
    expect(progressRepoMock.projectProgressUpdate).not.toHaveBeenCalled();
  });

  it("marks project completed when ownership and status are valid", async () => {
    projectRepoMock.projectFindUnique.mockResolvedValue({
      id: "project-1",
      status: "SUBMITTED",
      sme: { userId: "sme-1" },
      progress: {
        status: "SUBMITTED",
        deliverableUrl: "https://example.com/deliverable",
      },
    });
    projectRepoMock.updateProjectStatus.mockResolvedValue({});
    progressRepoMock.updateProgressByProjectId.mockResolvedValue({});

    const result = await markProjectCompletedBySme({
      projectId: "project-1",
      userId: "sme-1",
    });

    expect(result).toEqual({ ok: true, data: null });
    expect(projectRepoMock.updateProjectStatus).toHaveBeenCalled();
    expect(progressRepoMock.updateProgressByProjectId).toHaveBeenCalled();
  });
});
