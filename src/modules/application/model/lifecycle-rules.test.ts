import { describe, expect, it } from "vitest";

import {
  canAcceptCandidateStatus,
  canAcceptInvitation,
  canCompleteProject,
  canEvaluateCompletedProject,
  canMutateProgress,
  canProjectAcceptCandidates,
  canSubmitDeliverable,
} from "./lifecycle-rules";

describe("lifecycle-rules", () => {
  it("allows candidate acceptance only when project is OPEN", () => {
    expect(canProjectAcceptCandidates("OPEN")).toBe(true);
    expect(canProjectAcceptCandidates("IN_PROGRESS")).toBe(false);
    expect(canProjectAcceptCandidates("SUBMITTED")).toBe(false);
    expect(canProjectAcceptCandidates("COMPLETED")).toBe(false);
  });

  it("allows progress mutation only before submission/completion", () => {
    expect(canMutateProgress("NOT_STARTED")).toBe(true);
    expect(canMutateProgress("IN_PROGRESS")).toBe(true);
    expect(canMutateProgress("SUBMITTED")).toBe(false);
    expect(canMutateProgress("COMPLETED")).toBe(false);
  });

  it("allows deliverable submission only before submitted/completed", () => {
    expect(canSubmitDeliverable("NOT_STARTED")).toBe(true);
    expect(canSubmitDeliverable("IN_PROGRESS")).toBe(true);
    expect(canSubmitDeliverable("SUBMITTED")).toBe(false);
    expect(canSubmitDeliverable("COMPLETED")).toBe(false);
  });

  it("allows completing project only when submitted and deliverable exists", () => {
    expect(
      canCompleteProject({
        projectStatus: "SUBMITTED",
        progressStatus: "SUBMITTED",
        hasDeliverableUrl: true,
      }),
    ).toBe(true);

    expect(
      canCompleteProject({
        projectStatus: "IN_PROGRESS",
        progressStatus: "SUBMITTED",
        hasDeliverableUrl: true,
      }),
    ).toBe(false);

    expect(
      canCompleteProject({
        projectStatus: "SUBMITTED",
        progressStatus: "SUBMITTED",
        hasDeliverableUrl: false,
      }),
    ).toBe(false);
  });

  it("accepts candidate only from PENDING state", () => {
    expect(canAcceptCandidateStatus("PENDING")).toBe(true);
    expect(canAcceptCandidateStatus("INVITED")).toBe(false);
    expect(canAcceptCandidateStatus("ACCEPTED")).toBe(false);
    expect(canAcceptCandidateStatus("REJECTED")).toBe(false);
  });

  it("accepts invitation only when invitation comes from SME", () => {
    expect(canAcceptInvitation({ status: "INVITED", initiatedBy: "SME" })).toBe(true);
    expect(canAcceptInvitation({ status: "INVITED", initiatedBy: "STUDENT" })).toBe(false);
    expect(canAcceptInvitation({ status: "PENDING", initiatedBy: "SME" })).toBe(false);
  });

  it("allows evaluation only on completed project and completed progress", () => {
    expect(
      canEvaluateCompletedProject({
        projectStatus: "COMPLETED",
        progressStatus: "COMPLETED",
      }),
    ).toBe(true);

    expect(
      canEvaluateCompletedProject({
        projectStatus: "SUBMITTED",
        progressStatus: "COMPLETED",
      }),
    ).toBe(false);
  });
});
