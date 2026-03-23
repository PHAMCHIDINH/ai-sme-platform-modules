import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Clock, CheckCircle2, FileText, ListTodo } from "lucide-react";
import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { ACCESS_MESSAGES } from "@/modules/shared";
import { findStudentProfileByUserId, listProgressEntriesByStudentId } from "@/modules/shared";
import { addMilestoneForStudent, addProgressUpdateForStudent, parseMilestones, parseProgressUpdates, parseRating, progressStatusBarClassName, progressStatusClassName, progressStatusLabel, submitDeliverableForStudent, submitSmeEvaluationByStudent, } from "@/modules/progress";
import { actionFailure, actionSuccess, type FormActionResult } from "@/modules/shared";
import { Card, CardContent } from "@/modules/shared/ui";
import { Button } from "@/modules/shared/ui";
import { Badge } from "@/modules/shared/ui";
import { ProjectProgressActions } from "./project-progress-actions";
import { SmeEvaluationDialog } from "./sme-evaluation-dialog";

function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("vi-VN");
}

export default async function StudentMyProjectsPage() {
  const session = await auth();
  const studentUserId = getSessionUserIdByRole(session, "STUDENT");
  if (!studentUserId) return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;

  async function addMilestone(progressId: string, formData: FormData): Promise<FormActionResult> {
    "use server";

    const activeSession = await auth();
    const activeStudentUserId = getSessionUserIdByRole(activeSession, "STUDENT");

    if (!activeStudentUserId) {
      return actionFailure("Bạn không có quyền thực hiện thao tác này.");
    }

    const title = String(formData.get("title") ?? "").trim();
    if (!title) {
      return actionFailure("Milestone không được để trống.");
    }

    const result = await addMilestoneForStudent({
      progressId,
      userId: activeStudentUserId,
      title,
    });
    if (!result.ok) {
      return actionFailure(result.error);
    }

    revalidatePath("/student/my-projects");
    revalidatePath("/student/dashboard");
    revalidatePath(`/sme/projects/${result.data.projectId}`);
    return actionSuccess();
  }

  async function addProgressUpdate(progressId: string, formData: FormData): Promise<FormActionResult> {
    "use server";

    const activeSession = await auth();
    const activeStudentUserId = getSessionUserIdByRole(activeSession, "STUDENT");

    if (!activeStudentUserId) {
      return actionFailure("Bạn không có quyền thực hiện thao tác này.");
    }

    const content = String(formData.get("content") ?? "").trim();
    if (!content) {
      return actionFailure("Nội dung cập nhật không được để trống.");
    }

    const result = await addProgressUpdateForStudent({
      progressId,
      userId: activeStudentUserId,
      content,
    });
    if (!result.ok) {
      return actionFailure(result.error);
    }

    revalidatePath("/student/my-projects");
    revalidatePath("/student/dashboard");
    revalidatePath(`/sme/projects/${result.data.projectId}`);
    return actionSuccess();
  }

  async function submitDeliverable(
    progressId: string,
    projectId: string,
    formData: FormData,
  ): Promise<FormActionResult> {
    "use server";

    const activeSession = await auth();
    const activeStudentUserId = getSessionUserIdByRole(activeSession, "STUDENT");

    if (!activeStudentUserId) {
      return actionFailure("Bạn không có quyền thực hiện thao tác này.");
    }

    const deliverableUrl = String(formData.get("deliverableUrl") ?? "").trim();
    if (!deliverableUrl) {
      return actionFailure("Link bàn giao không được để trống.");
    }

    try {
      new URL(deliverableUrl);
    } catch {
      return actionFailure("Link bàn giao không hợp lệ.");
    }

    const result = await submitDeliverableForStudent({
      progressId,
      projectId,
      userId: activeStudentUserId,
      deliverableUrl,
    });
    if (!result.ok) {
      return actionFailure(result.error);
    }

    revalidatePath("/student/my-projects");
    revalidatePath("/student/dashboard");
    revalidatePath(`/sme/projects/${result.data.projectId}`);
    revalidatePath("/sme/projects");
    return actionSuccess();
  }

  async function submitSmeEvaluation(
    progressId: string,
    projectId: string,
    formData: FormData,
  ): Promise<FormActionResult> {
    "use server";

    const activeSession = await auth();
    const activeStudentUserId = getSessionUserIdByRole(activeSession, "STUDENT");

    if (!activeStudentUserId) {
      return actionFailure("Bạn không có quyền thực hiện thao tác này.");
    }

    const outputQuality = parseRating(formData.get("outputQuality"));
    const onTime = parseRating(formData.get("onTime"));
    const proactiveness = parseRating(formData.get("proactiveness"));
    const communication = parseRating(formData.get("communication"));
    const overallFit = parseRating(formData.get("overallFit"));

    if (
      outputQuality === null ||
      onTime === null ||
      proactiveness === null ||
      communication === null ||
      overallFit === null
    ) {
      return actionFailure("Vui lòng chọn điểm 1-5 cho tất cả tiêu chí.");
    }

    const comment = String(formData.get("comment") ?? "").trim();

    const result = await submitSmeEvaluationByStudent({
      progressId,
      projectId,
      userId: activeStudentUserId,
      outputQuality,
      onTime,
      proactiveness,
      communication,
      overallFit,
      comment,
    });
    if (!result.ok) {
      return actionFailure(result.error);
    }

    revalidatePath("/student/my-projects");
    revalidatePath(`/sme/projects/${result.data.projectId}`);
    revalidatePath("/sme/projects");
    return actionSuccess();
  }

  const profile = await findStudentProfileByUserId(studentUserId);

  if (!profile) return <div>Hãy cập nhật profile trước.</div>;

  const progressEntries = await listProgressEntriesByStudentId(profile.id, studentUserId);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dự án đang tham gia</h2>
        <p className="text-muted-foreground text-sm">Cập nhật tiến độ và bàn giao sản phẩm</p>
      </div>

      {progressEntries.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 border-dashed">
          <Clock className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground mb-4">Bạn chưa tham gia dự án nào.</p>
          <Link href="/student/projects">
            <Button>Tìm dự án ngay</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {progressEntries.map((entry) => {
            const milestones = parseMilestones(entry.milestones);
            const updates = parseProgressUpdates(entry.updates);
            const hasSmeEvaluation = entry.project.evaluations.length > 0;

            return (
              <Card
                key={entry.id}
                className="border border-border/50 shadow-sm bg-white/50 backdrop-blur overflow-hidden"
              >
                <div className={`h-2 w-full ${progressStatusBarClassName(entry.status)}`} />
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 justify-between">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">{entry.project.title}</h3>
                        <Badge
                          className={progressStatusClassName(entry.status)}
                          variant="outline"
                        >
                          {progressStatusLabel(entry.status)}
                        </Badge>
                      </div>

                      <p className="text-sm font-medium text-muted-foreground">
                        Khách hàng: {entry.project.sme.companyName}
                      </p>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border bg-background/60 p-4">
                          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                            <ListTodo className="h-4 w-4 text-primary" />
                            Milestones
                          </div>
                          {milestones.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              Chưa có milestone nào.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {milestones.map((milestone) => (
                                <div
                                  className="rounded-xl border bg-muted/20 px-3 py-2"
                                  key={milestone.id}
                                >
                                  <p className="text-sm font-medium">
                                    {milestone.title}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {formatDateTime(milestone.createdAt)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="rounded-2xl border bg-background/60 p-4">
                          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                            <FileText className="h-4 w-4 text-primary" />
                            Cập nhật tiến độ
                          </div>
                          {updates.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              Chưa có cập nhật nào.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {updates.map((update) => (
                                <div
                                  className="rounded-xl border bg-muted/20 px-3 py-2"
                                  key={update.id}
                                >
                                  <p className="text-sm">{update.content}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {formatDateTime(update.createdAt)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 rounded-2xl border bg-background/60 p-4 space-y-2">
                        <p className="text-sm">
                          <strong>Hạn chót:</strong>{" "}
                          {new Date(entry.deadline).toLocaleDateString("vi-VN")}
                        </p>
                        {entry.deliverableUrl ? (
                          <p className="text-sm">
                            <strong>Link bàn giao:</strong>{" "}
                            <a
                              className="text-primary hover:underline"
                              href={entry.deliverableUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Xem sản phẩm
                            </a>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:min-w-[240px] md:border-l md:pl-6">
                      {entry.status === "COMPLETED" ? (
                        <>
                          <Button
                            className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
                            variant="outline"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Đã hoàn thành
                          </Button>

                          {hasSmeEvaluation ? (
                            <Button
                              className="border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                              variant="outline"
                            >
                              Đã đánh giá ✓
                            </Button>
                          ) : (
                            <SmeEvaluationDialog
                              companyName={entry.project.sme.companyName}
                              submitAction={submitSmeEvaluation.bind(
                                null,
                                entry.id,
                                entry.projectId,
                              )}
                            />
                          )}
                        </>
                      ) : entry.status === "SUBMITTED" ? (
                        <Button
                          className="border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                          variant="outline"
                        >
                          Đã nộp, chờ SME nghiệm thu
                        </Button>
                      ) : (
                        <ProjectProgressActions
                          addMilestoneAction={addMilestone.bind(null, entry.id)}
                          addProgressUpdateAction={addProgressUpdate.bind(null, entry.id)}
                          entryId={entry.id}
                          entryStatus={entry.status}
                          submitDeliverableAction={submitDeliverable.bind(
                            null,
                            entry.id,
                            entry.projectId,
                          )}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
