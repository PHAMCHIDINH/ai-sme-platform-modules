import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { describeMatchScore, rankBySimilarity } from "@/modules/matching";
import { applyStudentProjectFilters, normalizeStudentProjectFilters, presentStudentProjectSummary } from "@/modules/project";
import { Badge, Button, DiscoveryResultCard, FilterSidebar } from "@/modules/shared/ui";
import {
  ACCESS_MESSAGES,
  findStudentProfileWithEmbeddingCached,
  listStudentDiscoveryProjectsCached,
  listStudentInvitationsCached,
  measureAsync,
} from "@/modules/shared";
import { ArrowRight, CalendarDays, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { ApplyButton } from "./apply-button";
import { ApplicationStatusBadge } from "./application-status-badge";
import { InvitationCard } from "./invitation-card";

type StudentInvitation = {
  id: string;
  projectId: string;
  project: {
    title: string;
    expectedOutput: string;
    budget: string | null;
    duration: string;
    sme: {
      companyName: string;
      avatarUrl?: string | null;
    };
  };
};

type StudentProjectsPageProps = {
  searchParams?: {
    q?: string | string[];
    difficulty?: string | string[];
    sort?: string | string[];
  };
};

export default async function StudentProjectsPage({ searchParams }: StudentProjectsPageProps) {
  const session = await measureAsync("auth.student.projects", () => auth());
  const studentUserId = getSessionUserIdByRole(session, "STUDENT");
  if (!studentUserId) return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;

  const profile = await measureAsync("data.student.profile.embedding", () =>
    findStudentProfileWithEmbeddingCached(studentUserId),
  );
  const [availableProjects, invitations] = await Promise.all([
    measureAsync("data.student.discovery.projects", () => listStudentDiscoveryProjectsCached(profile?.id ?? null)),
    profile
      ? measureAsync("data.student.discovery.invitations", () => listStudentInvitationsCached(profile.id))
      : Promise.resolve([] as StudentInvitation[]),
  ]);

  type RankedProject = (typeof availableProjects)[number] & { matchScore: number };
  const rankedProjects: RankedProject[] =
    profile?.embedding && profile.embedding.length > 0
    ? (rankBySimilarity(profile.embedding, availableProjects) as RankedProject[])
    : availableProjects.map((project) => ({ ...project, matchScore: 0 }));

  const filters = normalizeStudentProjectFilters(searchParams ?? {});
  const filteredProjects = applyStudentProjectFilters(rankedProjects, filters);

  const presentedProjects = filteredProjects
    .map((project) =>
      presentStudentProjectSummary(project, {
        hasStudentProfile: Boolean(profile),
        matchScore: project.matchScore,
      }),
    )
    .filter((project) => project.interactionState !== "INVITED" && project.interactionState !== "ACCEPTED");

  const hasEmbedding = Boolean(profile?.embedding && profile.embedding.length > 0);
  const sortFilterValue = filters.sort === "relevance" ? "match" : filters.sort;
  const visibleProjectCount = presentedProjects.length;

  return (
    <div className="space-y-6 pb-12 fade-in">
      <header className="portal-shell p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="space-y-3">
            <p className="portal-kicker">Student discovery</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Khám phá dự án phù hợp năng lực</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              AI gợi ý mức độ phù hợp từ hồ sơ kỹ năng của bạn. Hãy bắt đầu với các dự án có scope rõ ràng và đầu ra cụ thể.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700" variant="outline">
                {visibleProjectCount} dự án đang hiển thị
              </Badge>
              <Badge className="rounded-full border border-border bg-white px-3 py-1 text-slate-700" variant="outline">
                {hasEmbedding ? "AI match đã bật" : "Danh sách mặc định"}
              </Badge>
            </div>
          </div>
          <Link href="/student/profile">
            <Button className="h-11 rounded-full border border-border bg-white px-5 text-slate-700 hover:bg-slate-50" variant="outline">
              Cập nhật hồ sơ kỹ năng
            </Button>
          </Link>
        </div>
      </header>

      {invitations.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <h2 className="text-xl font-semibold text-slate-900">Lời mời trực tiếp từ SME</h2>
          </div>
          <div>
            {invitations.map((invitation) => (
              <InvitationCard invitation={invitation} key={invitation.id} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
        <FilterSidebar
          className="sticky top-6 h-fit"
          description="Thu hẹp danh sách theo keyword, độ khó, và cách sắp xếp."
          title="Discovery filters"
        >
          <form className="space-y-3" method="GET">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500" htmlFor="student-project-q">
                Từ khóa
              </label>
              <input
                className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                defaultValue={filters.q ?? ""}
                id="student-project-q"
                name="q"
                placeholder="Tìm theo tên dự án hoặc SME"
                type="search"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500"
                htmlFor="student-project-difficulty"
              >
                Mức độ khó
              </label>
              <select
                className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                defaultValue={filters.difficulty ?? ""}
                id="student-project-difficulty"
                name="difficulty"
              >
                <option value="">ALL</option>
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500" htmlFor="student-project-sort">
                Sắp xếp
              </label>
              <select
                className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                defaultValue={sortFilterValue}
                id="student-project-sort"
                name="sort"
              >
                <option value="match">match</option>
                <option value="newest">newest</option>
              </select>
            </div>

            <Button className="h-11 w-full rounded-full bg-emerald-700 text-white hover:bg-emerald-800" type="submit">
              Áp dụng bộ lọc
            </Button>
          </form>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Hồ sơ hiện tại</p>
            <Badge className="rounded-full border border-border bg-slate-50 text-slate-700" variant="outline">
              {hasEmbedding ? "Đã có embedding" : "Chưa có embedding"}
            </Badge>
            {!hasEmbedding ? (
              <p className="text-sm leading-6 text-slate-500">
                Cập nhật profile để hệ thống xếp hạng theo mức phù hợp kỹ năng.
              </p>
            ) : (
              <p className="text-sm leading-6 text-slate-500">
                Danh sách hiện đã được sắp xếp theo mức tương đồng kỹ năng.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Mẹo chọn dự án</p>
            <ul className="space-y-2 text-sm leading-6 text-slate-500">
              <li>Ưu tiên dự án có output rõ để bổ sung portfolio.</li>
              <li>Đọc kỹ skill tags trước khi apply.</li>
              <li>Theo dõi trạng thái phản hồi trong trang chi tiết.</li>
            </ul>
          </div>
        </FilterSidebar>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                {visibleProjectCount > 0 ? `${visibleProjectCount} dự án phù hợp để xem tiếp` : "Chưa có dự án phù hợp"}
              </p>
              <p className="text-sm leading-6 text-slate-500">
                Ưu tiên đọc title, thời lượng, trạng thái và kỹ năng yêu cầu trước khi mở chi tiết.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full border border-border bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
              Sort: {sortFilterValue === "match" ? "Match" : "Newest"}
            </div>
          </div>

          {!hasEmbedding ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <Search className="mt-0.5 h-4 w-4 text-amber-700" />
                <p className="text-sm leading-6 text-amber-700">
                  Bạn chưa chuẩn hóa profile kỹ năng. Vẫn có thể xem danh sách dự án, nhưng chưa có thứ tự match chính xác.
                </p>
              </div>
            </div>
          ) : null}

          {presentedProjects.length === 0 ? (
            <div className="portal-panel flex min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-lg font-semibold text-slate-900">Chưa có dự án phù hợp ở thời điểm này</p>
              <p className="max-w-md text-sm leading-6 text-slate-500">
                Hãy cập nhật thêm kỹ năng hoặc quay lại sau khi SME mở thêm bài toán mới.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              {presentedProjects.map((project) => {
                const fitDescription = describeMatchScore(project.matchScore, { hasSignal: hasEmbedding });
                const canApply = project.interactionState === "READY_TO_APPLY";
                const applyDisabledReason = !profile ? "Bạn cần tạo hồ sơ sinh viên trước khi ứng tuyển." : undefined;

                return (
                  <DiscoveryResultCard
                    actions={
                      <div className="flex w-full flex-wrap items-center justify-between gap-2">
                        <Link href={`/student/projects/${project.id}`}>
                          <Button className="h-10 rounded-full border border-border bg-white px-4 text-slate-700 hover:bg-slate-50" variant="outline">
                            Xem chi tiết <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        {canApply ? (
                          <ApplyButton
                            ctaLabel="Ứng tuyển"
                            className="h-10 rounded-full border-0 bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800"
                            disabledReason={applyDisabledReason}
                            matchScore={project.matchScore}
                            projectId={project.id}
                          />
                        ) : (
                          <div className="inline-flex items-center rounded-full border border-border bg-slate-50 px-4 text-xs font-medium text-slate-600">
                            Theo dõi trạng thái ở trang chi tiết
                          </div>
                        )}
                      </div>
                    }
                    badges={
                      <>
                        {project.requiredSkills.slice(0, 3).map((skill: string) => (
                          <span
                            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                            key={skill}
                          >
                            {skill}
                          </span>
                        ))}
                        {project.requiredSkills.length > 3 ? (
                          <span className="rounded-full border border-border bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            +{project.requiredSkills.length - 3}
                          </span>
                        ) : null}
                      </>
                    }
                    eyebrow={project.companyName}
                    className="h-full"
                    key={project.id}
                    leading={
                      project.companyAvatarUrl ? (
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
                      )
                    }
                    metadata={
                      <>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {project.duration}
                        </span>
                        {project.matchScore > 0 ? <span>{fitDescription.label}</span> : null}
                        {project.interactionState !== "READY_TO_APPLY" ? (
                          <ApplicationStatusBadge className="max-w-full" state={project.interactionState} />
                        ) : null}
                      </>
                    }
                    score={project.matchScore > 0 ? `${project.matchScore}% match` : "No score"}
                    summary={project.expectedOutput}
                    title={project.title}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
