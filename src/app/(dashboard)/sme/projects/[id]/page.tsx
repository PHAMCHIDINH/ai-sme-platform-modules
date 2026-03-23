import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, FileText, ListTodo, Users, } from "lucide-react";
import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { ACCESS_MESSAGES } from "@/modules/shared";
import { findSmeProjectDetailById } from "@/modules/shared";
import { markProjectCompletedBySme, parseMilestones, parseProgressUpdates, progressStatusClassName, progressStatusLabel, } from "@/modules/progress";
import { projectStatusLabel } from "@/modules/project";
import { actionFailure, actionSuccess, type FormActionResult } from "@/modules/shared";
import { Badge } from "@/modules/shared/ui";
import { Button } from "@/modules/shared/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui";
import { AcceptDeliverableButton } from "./accept-deliverable-button";

function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("vi-VN");
}

function projectStatusTone(status: string) {
  if (status === "OPEN") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "IN_PROGRESS") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "COMPLETED") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
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
    <div className="space-y-8 pb-12 fade-in">
      <header className="portal-shell p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="portal-kicker">Project detail</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">{project.title}</h1>
              <Badge className={`rounded-full border px-3 font-semibold ${projectStatusTone(project.status)}`} variant="outline">
                {projectStatusLabel(project.status)}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              Đăng ngày: {new Date(project.createdAt).toLocaleDateString("vi-VN")}
            </p>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              Theo dõi ứng viên, tiến độ triển khai và trạng thái nghiệm thu của dự án trong cùng một workspace.
            </p>
          </div>
          <Link href="/sme/projects">
            <Button className="rounded-full border border-border bg-white text-slate-700 hover:bg-slate-50" variant="outline">
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách dự án
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="portal-panel border-border/70 shadow-none">
            <CardHeader>
              <CardTitle>Nội dung dự án</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-500">
                  Mô tả bài toán
                </h4>
                <div className="whitespace-pre-wrap rounded-xl border border-border/70 bg-slate-50 p-4 text-sm leading-relaxed">
                  {project.description}
                </div>
              </div>

              {project.standardizedBrief ? (
                <div>
                  <h4 className="mb-2 flex items-center text-sm font-semibold text-indigo-600">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Brief đã chuẩn hóa (Bằng AI)
                  </h4>
                  <div className="whitespace-pre-wrap rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-relaxed">
                    {project.standardizedBrief}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/70 bg-slate-50 p-4">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">
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
                <div className="rounded-xl border border-border/70 bg-slate-50 p-4">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Thời gian dự kiến
                  </span>
                  <span className="font-semibold">{project.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <Card className="portal-panel border-border/70 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-900">
                <Users className="mr-2 h-5 w-5 text-emerald-700" />
                Ứng viên & Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center">
                <div className="mb-2 text-4xl font-semibold text-slate-900">
                  {project._count.applications}
                </div>
                <p className="mb-6 text-sm font-medium text-slate-500">
                  Sinh viên đã ứng tuyển
                </p>
                <Link href={`/sme/projects/${project.id}/candidates`}>
                  <Button className="w-full rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800">
                    Xem ứng viên & Gợi ý AI <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="portal-panel border-border/70 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Clock className="mr-2 h-4 w-4 text-slate-500" />
                Tiến độ hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.status === "OPEN" ? (
                <div className="py-4 text-center text-sm text-slate-500">
                  Dự án đang mở, đợi chốt ứng viên.
                </div>
              ) : !project.progress ? (
                <div className="py-4 text-center text-sm text-slate-500">
                  Chưa có dữ liệu tiến độ cho dự án này.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-500">Trạng thái</span>
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
                        <Button className="w-full rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800">
                          Đánh giá sinh viên
                        </Button>
                      </Link>
                    )
                  ) : null}

                  {project.progress.deliverableUrl ? (
                    <div className="rounded-xl border border-border/70 bg-slate-50 p-4">
                      <p className="text-sm font-semibold">Link bàn giao</p>
                      <a
                        className="mt-2 inline-block text-sm text-emerald-700 hover:underline"
                        href={project.progress.deliverableUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Xem sản phẩm đã nộp
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border/70 bg-slate-50 p-4 text-sm text-slate-500">
                      Sinh viên chưa nộp link bàn giao.
                    </div>
                  )}

                  <div className="rounded-xl border border-border/70 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <ListTodo className="h-4 w-4 text-emerald-700" />
                      Milestones
                    </div>
                    {milestones.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Chưa có milestone nào.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {milestones.map((milestone) => (
                          <div className="rounded-xl border border-border/70 bg-white px-3 py-2" key={milestone.id}>
                            <p className="text-sm font-medium">{milestone.title}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDateTime(milestone.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-border/70 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <FileText className="h-4 w-4 text-emerald-700" />
                      Cập nhật tiến độ
                    </div>
                    {updates.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Chưa có cập nhật nào.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {updates.map((update) => (
                          <div className="rounded-xl border border-border/70 bg-white px-3 py-2" key={update.id}>
                            <p className="text-sm">{update.content}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDateTime(update.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {project.progress.deadline ? (
                    <div className="text-sm text-slate-500">
                      Hạn chót:{" "}
                      <span className="font-medium text-slate-900">
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
