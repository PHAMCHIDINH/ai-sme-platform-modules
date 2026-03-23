import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, FileText, ListTodo, Users, } from "lucide-react";
import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { ACCESS_MESSAGES } from "@/modules/shared";
import { findSmeProjectDetailById } from "@/modules/shared";
import { markProjectCompletedBySme, parseMilestones, parseProgressUpdates, progressStatusClassName, progressStatusLabel, } from "@/modules/progress";
import { projectStatusClassName, projectStatusLabel } from "@/modules/project";
import { actionFailure, actionSuccess, type FormActionResult } from "@/modules/shared";
import { Badge } from "@/modules/shared/ui";
import { Button } from "@/modules/shared/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui";
import { AcceptDeliverableButton } from "./accept-deliverable-button";

function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("vi-VN");
}

export default async function SMEProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const smeUserId = getSessionUserIdByRole(session, "SME");

  if (!smeUserId) {
    return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;
  }

  async function markAsCompleted(projectId: string): Promise<FormActionResult> {
    "use server";

    try {
      const activeSession = await auth();
      const activeSmeUserId = getSessionUserIdByRole(activeSession, "SME");

      if (!activeSmeUserId) {
        return actionFailure("Bạn không có quyền thực hiện thao tác này.");
      }

      const result = await markProjectCompletedBySme({
        projectId,
        userId: activeSmeUserId,
      });
      if (!result.ok) {
        return actionFailure(result.error);
      }

      revalidatePath(`/sme/projects/${projectId}`);
      revalidatePath("/sme/projects");
      revalidatePath("/student/my-projects");
      revalidatePath("/student/dashboard");
      return actionSuccess();
    } catch (error) {
      console.error("markAsCompleted error:", error);
      return actionFailure("Không thể nghiệm thu bàn giao lúc này. Vui lòng thử lại.");
    }
  }

  const project = await findSmeProjectDetailById(params.id);

  if (!project) {
    return notFound();
  }

  if (project.sme.userId !== smeUserId) {
    return <div>{ACCESS_MESSAGES.FORBIDDEN_PAGE}</div>;
  }

  const milestones = project.progress
    ? parseMilestones(project.progress.milestones)
    : [];
  const updates = project.progress
    ? parseProgressUpdates(project.progress.updates)
    : [];
  const hasStudentEvaluation = project.evaluations.length > 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/sme/projects">
          <Button className="rounded-full" size="icon" variant="ghost">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{project.title}</h2>
            <Badge
              variant={project.status === "OPEN" ? "default" : "outline"}
              className={project.status === "OPEN" ? undefined : projectStatusClassName(project.status)}
            >
              {projectStatusLabel(project.status)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Đăng ngày: {new Date(project.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-none bg-white/50 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle>Nội dung dự án</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                  Mô tả bài toán
                </h4>
                <div className="rounded-xl bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </div>
              </div>

              {project.standardizedBrief ? (
                <div>
                  <h4 className="mb-2 flex items-center text-sm font-semibold text-indigo-600">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Brief đã chuẩn hóa (Bằng AI)
                  </h4>
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {project.standardizedBrief}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-muted/30 p-4">
                  <span className="mb-1 block text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Mức độ khó
                  </span>
                  <span className="font-semibold">
                    {project.difficulty === "EASY"
                      ? "Dễ"
                      : project.difficulty === "MEDIUM"
                        ? "Trung bình"
                        : "Khó"}
                  </span>
                </div>
                <div className="rounded-xl bg-muted/30 p-4">
                  <span className="mb-1 block text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Thời gian dự kiến
                  </span>
                  <span className="font-semibold">{project.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Users className="mr-2 h-5 w-5" />
                Ứng viên & Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center">
                <div className="mb-2 text-4xl font-black text-blue-600">
                  {project._count.applications}
                </div>
                <p className="mb-6 text-sm font-medium text-blue-800/70">
                  Sinh viên đã ứng tuyển
                </p>
                <Link href={`/sme/projects/${project.id}/candidates`}>
                  <Button className="w-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700">
                    Xem ứng viên & Gợi ý AI <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/50 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                Tiến độ hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.status === "OPEN" ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Dự án đang mở, đợi chốt ứng viên.
                </div>
              ) : !project.progress ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Chưa có dữ liệu tiến độ cho dự án này.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">Trạng thái</span>
                    <Badge
                      className={progressStatusClassName(project.progress.status)}
                      variant="outline"
                    >
                      {progressStatusLabel(project.progress.status)}
                    </Badge>
                  </div>

                  {project.status === "COMPLETED" ? (
                    hasStudentEvaluation ? (
                      <Badge
                        className="w-full justify-center border-green-200 bg-green-50 py-2 text-green-700"
                        variant="outline"
                      >
                        Đã đánh giá ✓
                      </Badge>
                    ) : (
                      <Link href={`/sme/projects/${project.id}/evaluate`}>
                        <Button className="w-full">Đánh giá sinh viên</Button>
                      </Link>
                    )
                  ) : null}

                  {project.progress.deliverableUrl ? (
                    <div className="rounded-xl border bg-background/60 p-4">
                      <p className="text-sm font-semibold">Link bàn giao</p>
                      <a
                        className="mt-2 inline-block text-sm text-primary hover:underline"
                        href={project.progress.deliverableUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Xem sản phẩm đã nộp
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-xl border bg-background/60 p-4 text-sm text-muted-foreground">
                      Sinh viên chưa nộp link bàn giao.
                    </div>
                  )}

                  <div className="rounded-xl border bg-background/60 p-4">
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
                            <p className="text-sm font-medium">{milestone.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDateTime(milestone.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border bg-background/60 p-4">
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

                  {project.progress.deadline ? (
                    <div className="text-sm text-muted-foreground">
                      Hạn chót:{" "}
                      <span className="font-medium text-foreground">
                        {new Date(project.progress.deadline).toLocaleDateString(
                          "vi-VN",
                        )}
                      </span>
                    </div>
                  ) : null}

                  {project.status === "SUBMITTED" ? (
                    <AcceptDeliverableButton
                      action={markAsCompleted.bind(null, project.id)}
                    />
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
