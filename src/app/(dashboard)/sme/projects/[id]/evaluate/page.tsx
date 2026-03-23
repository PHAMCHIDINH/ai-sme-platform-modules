import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { ACCESS_MESSAGES } from "@/modules/shared";
import { actionFailure, type FormActionResult } from "@/modules/shared";
import {
  createSmeEvaluation,
  findOwnedProjectForEvaluation,
  findSmeProjectForEvaluationPage,
} from "@/modules/shared";
import { Button } from "@/modules/shared/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui";
import { EvaluateForm } from "./evaluate-form";

function parseRating(value: FormDataEntryValue | null): number | null {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }
  return rating;
}

function formatCreatedAt(value: Date) {
  return new Date(value).toLocaleString("vi-VN");
}

export default async function EvaluatePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const smeUserId = getSessionUserIdByRole(session, "SME");

  if (!smeUserId) {
    return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;
  }

  const project = await findSmeProjectForEvaluationPage(params.id);

  if (!project) {
    return notFound();
  }

  if (project.sme.userId !== smeUserId) {
    return <div>{ACCESS_MESSAGES.FORBIDDEN_PAGE}</div>;
  }

  if (project.status !== "COMPLETED") {
    redirect(`/sme/projects/${project.id}`);
  }

  if (!project.progress?.student) {
    redirect(`/sme/projects/${project.id}`);
  }

  async function submitEvaluation(formData: FormData): Promise<FormActionResult> {
    "use server";

    const activeSession = await auth();
    const activeSmeUserId = getSessionUserIdByRole(activeSession, "SME");

    if (!activeSmeUserId) {
      return actionFailure("Bạn không có quyền thực hiện thao tác này.");
    }

    const ownedProject = await findOwnedProjectForEvaluation(params.id);

    if (!ownedProject || ownedProject.sme.userId !== activeSmeUserId) {
      return actionFailure("Bạn không có quyền đánh giá dự án này.");
    }

    if (
      ownedProject.status !== "COMPLETED" ||
      !ownedProject.progress ||
      ownedProject.evaluations.length > 0
    ) {
      return actionFailure("Không thể gửi đánh giá cho dự án này.");
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

    await createSmeEvaluation({
      projectId: ownedProject.id,
      evaluatorId: activeSmeUserId,
      evaluateeId: ownedProject.progress.student.userId,
      outputQuality,
      onTime,
      proactiveness,
      communication,
      overallFit,
      comment: comment || null,
    });

    revalidatePath(`/sme/projects/${ownedProject.id}/evaluate`);
    revalidatePath(`/sme/projects/${ownedProject.id}`);
    revalidatePath("/sme/projects");
    revalidatePath("/student/my-projects");
    revalidatePath("/student/dashboard");
    redirect(`/sme/projects/${ownedProject.id}`);
  }

  const existingEvaluation = project.evaluations[0] ?? null;
  const studentName = project.progress.student.user.name;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12 fade-in">
      <header className="portal-shell p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="portal-kicker">SME evaluation</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Đánh giá sinh viên sau dự án</h1>
            <p className="text-sm leading-6 text-slate-600 md:text-base">
              Ghi nhận mức độ đáp ứng và hiệu quả hợp tác để hoàn tất vòng đời dự án.
            </p>
          </div>
          <Link href={`/sme/projects/${params.id}`}>
            <Button className="rounded-full border border-border bg-white text-slate-700 hover:bg-slate-50" variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Quay lại dự án
            </Button>
          </Link>
        </div>
      </header>

      <section className="portal-panel p-5 md:p-6">
        <p className="text-sm text-slate-500">
          Dự án: <span className="font-semibold text-slate-700">{project.title}</span>
        </p>
        <p className="text-sm text-slate-500">
          Sinh viên: <span className="font-semibold text-slate-700">{studentName}</span>
        </p>
      </section>

      {existingEvaluation ? (
        <Card className="portal-panel border-border/70 shadow-none">
          <CardHeader>
            <CardTitle>Bạn đã gửi đánh giá cho sinh viên này</CardTitle>
            <p className="text-sm text-slate-500">Thời gian gửi: {formatCreatedAt(existingEvaluation.createdAt)}</p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-slate-50 p-3">
                Chất lượng đầu ra: <strong>{existingEvaluation.outputQuality}/5</strong>
              </div>
              <div className="rounded-xl border border-border/70 bg-slate-50 p-3">
                Đúng tiến độ: <strong>{existingEvaluation.onTime}/5</strong>
              </div>
              <div className="rounded-xl border border-border/70 bg-slate-50 p-3">
                Chủ động: <strong>{existingEvaluation.proactiveness}/5</strong>
              </div>
              <div className="rounded-xl border border-border/70 bg-slate-50 p-3">
                Giao tiếp: <strong>{existingEvaluation.communication}/5</strong>
              </div>
              <div className="rounded-xl border border-border/70 bg-slate-50 p-3 sm:col-span-2">
                Tổng thể: <strong>{existingEvaluation.overallFit}/5</strong>
              </div>
            </div>

            {existingEvaluation.comment ? (
              <div className="rounded-xl border border-border/70 bg-slate-50 p-4">
                <p className="mb-1 font-medium">Nhận xét</p>
                <p className="whitespace-pre-wrap text-slate-600">{existingEvaluation.comment}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 bg-slate-50 p-4 text-slate-500">
                Không có nhận xét bổ sung.
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <EvaluateForm studentName={studentName} submitAction={submitEvaluation} />
      )}
    </div>
  );
}
