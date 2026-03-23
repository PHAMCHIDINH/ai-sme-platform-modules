import { ApplicationStatus, Initiator, ProgressStatus, ProjectStatus } from "@prisma/client";

export function canProjectAcceptCandidates(status: ProjectStatus) {
  return status === "OPEN";
}

export function canMutateProgress(status: ProgressStatus) {
  return status === "NOT_STARTED" || status === "IN_PROGRESS";
}

export function canSubmitDeliverable(status: ProgressStatus) {
  return status === "NOT_STARTED" || status === "IN_PROGRESS";
}

export function canCompleteProject(params: {
  projectStatus: ProjectStatus;
  progressStatus: ProgressStatus | null | undefined;
  hasDeliverableUrl: boolean;
}) {
  return (
    params.projectStatus === "SUBMITTED" &&
    params.progressStatus === "SUBMITTED" &&
    params.hasDeliverableUrl
  );
}

export function canAcceptCandidateStatus(status: ApplicationStatus) {
  return status === "PENDING";
}

export function canAcceptInvitation(params: {
  status: ApplicationStatus;
  initiatedBy: Initiator;
}) {
  return params.status === "INVITED" && params.initiatedBy === "SME";
}

export function canEvaluateCompletedProject(params: {
  projectStatus: ProjectStatus;
  progressStatus: ProgressStatus;
}) {
  return params.projectStatus === "COMPLETED" && params.progressStatus === "COMPLETED";
}
