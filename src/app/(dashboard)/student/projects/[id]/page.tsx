import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, CalendarDays, ChevronLeft, Sparkles, Target } from "lucide-react";
import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { describeMatchScore, rankBySimilarity } from "@/modules/matching";
import {
  ACCESS_MESSAGES,
  findStudentDiscoveryProjectById,
  findStudentProfileWithEmbedding,
} from "@/modules/shared";
import { Card, CardContent } from "@/modules/shared/ui";
import { Button } from "@/modules/shared/ui";
import { presentStudentProjectDetail } from "@/modules/project";
import { ApplyButton } from "../apply-button";
import { ApplicationStatusBadge } from "../application-status-badge";

export default async function StudentProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const studentUserId = getSessionUserIdByRole(session, "STUDENT");

  if (!studentUserId) {
    return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;
  }

  const profile = await findStudentProfileWithEmbedding(studentUserId);
  const rawProject = await findStudentDiscoveryProjectById(params.id, profile?.id ?? null);

  if (!rawProject) {
    return notFound();
  }

  const matchScore =
    profile?.embedding && profile.embedding.length > 0
      ? rankBySimilarity(profile.embedding, [rawProject])[0]?.matchScore ?? 0
      : 0;

  const project = presentStudentProjectDetail(rawProject, {
    hasStudentProfile: Boolean(profile),
    matchScore,
  });

  const fitDescription = describeMatchScore(matchScore, {
    hasSignal: Boolean(profile?.embedding && profile.embedding.length > 0),
  });
  const applyDisabledReason = profile
    ? undefined
    : "Bạn cần tạo hồ sơ sinh viên trước khi ứng tuyển.";
  const canApply = project.interactionState === "READY_TO_APPLY";

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/student/projects">
          <Button className="rounded-full border border-border bg-white text-slate-700 hover:bg-slate-50" size="icon" variant="outline">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{project.title}</h1>
            <ApplicationStatusBadge state={project.interactionState} />
          </div>
          <p className="text-sm font-medium text-slate-500">
            Xem rõ phạm vi bài toán trước khi quyết định ứng tuyển.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_360px]">
        <div className="space-y-6">
          <Card className="!rounded-2xl !border !border-border/70 !bg-white !shadow-sm">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-wrap items-center gap-3">
                {project.companyAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={`Avatar của ${project.companyName}`}
                    className="h-10 w-10 rounded-full border border-emerald-200 object-cover"
                    src={project.companyAvatarUrl}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700">
                    {project.companyName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                  <Building2 className="h-3.5 w-3.5" />
                  {project.companyName}
                </span>
                {project.companyIndustry ? (
                  <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-sky-700">
                    {project.companyIndustry}
                  </span>
                ) : null}
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Kỳ vọng đầu ra</h2>
                <p className="text-sm leading-relaxed text-slate-700">
                  {project.expectedOutput}
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Bài toán doanh nghiệp</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {project.description}
                </p>
              </div>

              {project.standardizedBrief ? (
                <div className="space-y-2">
                  <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-indigo-700">
                    <Sparkles className="h-4 w-4" />
                    Brief đã chuẩn hóa
                  </h2>
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-relaxed text-indigo-900/80">
                    {project.standardizedBrief}
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Kỹ năng nên có</h2>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill) => (
                    <span
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                      key={skill}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {project.companyDescription ? (
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Giới thiệu doanh nghiệp</h2>
                  <div className="flex items-center gap-2">
                    {project.companyAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={`Avatar của ${project.companyName}`}
                        className="h-9 w-9 rounded-full border border-emerald-200 object-cover"
                        src={project.companyAvatarUrl}
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700">
                        {project.companyName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="text-sm font-medium text-slate-700">{project.companyName}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {project.companyDescription}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="!rounded-2xl !border !border-border/70 !bg-white !shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Độ phù hợp</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-semibold text-slate-900">{project.matchScore}%</span>
                  <span className="pb-1 text-sm font-medium text-slate-500">{fitDescription.label}</span>
                </div>
                <p className="text-sm text-slate-600">{fitDescription.helper}</p>
              </div>

              <div className="grid gap-3 text-sm font-medium">
                <div className="flex items-center justify-between rounded-xl border border-border bg-slate-50 px-3 py-2 text-slate-700">
                  <span className="inline-flex items-center gap-2 uppercase">
                    <CalendarDays className="h-4 w-4" />
                    Thời lượng
                  </span>
                  <span>{project.duration}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-slate-50 px-3 py-2 text-slate-700">
                  <span className="uppercase">Ngân sách</span>
                  <span>{project.budget || "Thỏa thuận"}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-slate-50 px-3 py-2 text-slate-700">
                  <span className="inline-flex items-center gap-2 uppercase">
                    <Target className="h-4 w-4" />
                    Độ khó
                  </span>
                  <span>
                    {project.difficulty === "EASY"
                      ? "Dễ"
                      : project.difficulty === "HARD"
                        ? "Khó"
                        : "Trung bình"}
                  </span>
                </div>
              </div>

              {canApply ? (
                <ApplyButton
                  className="h-11 w-full rounded-full border-0 bg-emerald-700 text-sm font-semibold text-white hover:bg-emerald-800"
                  disabledReason={applyDisabledReason}
                  matchScore={project.matchScore}
                  projectId={project.id}
                />
              ) : project.interactionState === "PROFILE_REQUIRED" ? (
                <Link href="/student/profile">
                  <Button className="h-11 w-full rounded-full border border-border bg-white text-slate-700 hover:bg-slate-50" variant="outline">
                    Cập nhật hồ sơ để ứng tuyển
                  </Button>
                </Link>
              ) : (
                <div className="rounded-xl border border-border bg-slate-50 p-3 text-center text-sm font-medium text-slate-600">
                  Trạng thái hiện tại không hỗ trợ ứng tuyển lại từ trang này.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
