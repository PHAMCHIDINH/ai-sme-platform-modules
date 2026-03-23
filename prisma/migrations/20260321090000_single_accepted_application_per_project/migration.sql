-- Enforce lifecycle invariant: only one accepted application per project.
CREATE UNIQUE INDEX IF NOT EXISTS "Application_one_accepted_per_project"
ON "Application" ("projectId")
WHERE "status" = 'ACCEPTED';
