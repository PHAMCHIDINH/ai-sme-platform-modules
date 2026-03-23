import { describe, expect, it, vi } from "vitest";

import {
  LifecycleConflictError,
  applyAcceptanceBySme,
  applyInvitationAcceptanceByStudent,
  rejectInvitationByStudent,
  rejectPendingCandidateBySme,
} from "./application-lifecycle";

function createTxMock() {
  return {
    application: {
      updateMany: vi.fn(),
    },
    projectProgress: {
      upsert: vi.fn(),
    },
    project: {
      updateMany: vi.fn(),
    },
  };
}

describe("application-lifecycle service", () => {
  it("accepts pending candidate and updates project to IN_PROGRESS", async () => {
    const tx = createTxMock();
    tx.application.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 2 });
    tx.projectProgress.upsert.mockResolvedValue({});
    tx.project.updateMany.mockResolvedValue({ count: 1 });

    await applyAcceptanceBySme(tx as never, {
      projectId: "p1",
      studentId: "s1",
      deadline: new Date("2026-03-30T00:00:00.000Z"),
    });

    expect(tx.application.updateMany).toHaveBeenCalledTimes(2);
    expect(tx.project.updateMany).toHaveBeenCalledWith({
      where: { id: "p1", status: "OPEN" },
      data: { status: "IN_PROGRESS" },
    });
  });

  it("throws conflict when no pending candidate is updated", async () => {
    const tx = createTxMock();
    tx.application.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      applyAcceptanceBySme(tx as never, {
        projectId: "p1",
        studentId: "s1",
        deadline: new Date("2026-03-30T00:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(LifecycleConflictError);
  });

  it("rejects pending candidate by SME with optimistic status check", async () => {
    const tx = createTxMock();
    tx.application.updateMany.mockResolvedValue({ count: 1 });

    await rejectPendingCandidateBySme(tx as never, {
      projectId: "p1",
      studentId: "s1",
    });

    expect(tx.application.updateMany).toHaveBeenCalledWith({
      where: {
        projectId: "p1",
        studentId: "s1",
        status: "PENDING",
      },
      data: { status: "REJECTED" },
    });
  });

  it("accepts invitation by student and moves project to IN_PROGRESS", async () => {
    const tx = createTxMock();
    tx.application.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 3 });
    tx.projectProgress.upsert.mockResolvedValue({});
    tx.project.updateMany.mockResolvedValue({ count: 1 });

    await applyInvitationAcceptanceByStudent(tx as never, {
      applicationId: "a1",
      projectId: "p1",
      studentId: "s1",
      deadline: new Date("2026-03-30T00:00:00.000Z"),
    });

    expect(tx.application.updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        id: "a1",
        status: "INVITED",
        initiatedBy: "SME",
      },
      data: { status: "ACCEPTED" },
    });
  });

  it("rejects invitation only when it is still INVITED by SME", async () => {
    const tx = createTxMock();
    tx.application.updateMany.mockResolvedValue({ count: 1 });

    await rejectInvitationByStudent(tx as never, { applicationId: "a1" });

    expect(tx.application.updateMany).toHaveBeenCalledWith({
      where: {
        id: "a1",
        status: "INVITED",
        initiatedBy: "SME",
      },
      data: { status: "REJECTED" },
    });
  });
});
