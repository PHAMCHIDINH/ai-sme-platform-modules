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
          <Button className="rounded-full" size="icon" variant="ghost">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black uppercase tracking-tight">{project.title}</h1>
            <ApplicationStatusBadge state={project.interactionState} />
          </div>
          <p className="text-sm font-semibold text-black/70">
            Xem rõ phạm vi bài toán trước khi quyết định ứng tuyển.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_360px]">
        <div className="space-y-6">
          <Card className="border-2 border-black bg-white shadow-neo-md">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 border-2 border-black bg-gray-100 px-3 py-1 text-xs font-black uppercase shadow-neo-sm">
                  <Building2 className="h-3.5 w-3.5" />
                  {project.companyName}
                </span>
                {project.companyIndustry ? (
                  <span className="inline-flex items-center border-2 border-black bg-cyan-100 px-3 py-1 text-xs font-black uppercase shadow-neo-sm">
                    {project.companyIndustry}
                  </span>
                ) : null}
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-black uppercase">Kỳ vọng đầu ra</h2>
                <p className="text-sm font-medium leading-relaxed text-black/80">
                  {project.expectedOutput}
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-black uppercase">Bài toán doanh nghiệp</h2>
                <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-black/80">
                  {project.description}
                </p>
              </div>

              {project.standardizedBrief ? (
                <div className="space-y-2">
                  <h2 className="inline-flex items-center gap-2 text-sm font-black uppercase text-indigo-700">
                    <Sparkles className="h-4 w-4" />
                    Brief đã chuẩn hóa
                  </h2>
                  <div className="border-2 border-black bg-indigo-50 p-4 text-sm font-medium leading-relaxed text-black/80 shadow-neo-sm">
                    {project.standardizedBrief}
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                <h2 className="text-sm font-black uppercase">Kỹ năng nên có</h2>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill) => (
                    <span
                      className="border-2 border-black bg-yellow-100 px-2 py-1 text-xs font-black uppercase shadow-neo-sm"
                      key={skill}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {project.companyDescription ? (
                <div className="space-y-2">
                  <h2 className="text-sm font-black uppercase">Giới thiệu doanh nghiệp</h2>
                  <p className="text-sm font-medium leading-relaxed text-black/80">
                    {project.companyDescription}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-black bg-lime-100 shadow-neo-md">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase">Độ phù hợp</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black">{project.matchScore}%</span>
                  <span className="pb-1 text-sm font-semibold text-black/70">{fitDescription.label}</span>
                </div>
                <p className="text-sm font-medium text-black/80">{fitDescription.helper}</p>
              </div>

              <div className="grid gap-3 text-sm font-bold">
                <div className="flex items-center justify-between border-2 border-black bg-white px-3 py-2 shadow-neo-sm">
                  <span className="inline-flex items-center gap-2 uppercase">
                    <CalendarDays className="h-4 w-4" />
                    Thời lượng
                  </span>
                  <span>{project.duration}</span>
                </div>
                <div className="flex items-center justify-between border-2 border-black bg-white px-3 py-2 shadow-neo-sm">
                  <span className="uppercase">Ngân sách</span>
                  <span>{project.budget || "Thỏa thuận"}</span>
                </div>
                <div className="flex items-center justify-between border-2 border-black bg-white px-3 py-2 shadow-neo-sm">
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
                  className="h-14 w-full border-2 border-black bg-white text-black hover:bg-black hover:text-white"
                  disabledReason={applyDisabledReason}
                  matchScore={project.matchScore}
                  projectId={project.id}
                />
              ) : project.interactionState === "PROFILE_REQUIRED" ? (
                <Link href="/student/profile">
                  <Button className="h-14 w-full border-2 border-black bg-yellow-300 text-black hover:bg-yellow-400">
                    Cập nhật hồ sơ để ứng tuyển
                  </Button>
                </Link>
              ) : (
                <div className="border-2 border-black bg-white p-3 text-center text-sm font-bold shadow-neo-sm">
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
