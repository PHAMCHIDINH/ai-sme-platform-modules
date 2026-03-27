-- Speed up remote-read paths for dashboard, discovery, and application state checks.
CREATE INDEX "Project_status_createdAt_idx"
ON "Project" ("status", "createdAt" DESC);

CREATE INDEX "Project_smeId_createdAt_idx"
ON "Project" ("smeId", "createdAt" DESC);

CREATE INDEX "Application_studentId_status_initiatedBy_idx"
ON "Application" ("studentId", "status", "initiatedBy");

CREATE INDEX "Application_projectId_status_idx"
ON "Application" ("projectId", "status");

CREATE INDEX "ProjectProgress_studentId_status_idx"
ON "ProjectProgress" ("studentId", "status");

CREATE INDEX "Evaluation_evaluateeId_type_idx"
ON "Evaluation" ("evaluateeId", "type");
