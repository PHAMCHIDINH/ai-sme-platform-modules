import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { ACCESS_MESSAGES, findStudentProfileWithEmbedding, listStudentDiscoveryProjects, listStudentInvitations } from "@/modules/shared";
import Link from "next/link";
import { describeMatchScore, rankBySimilarity } from "@/modules/matching";
import { presentStudentProjectSummary } from "@/modules/project";
import { Building2, CalendarDays, Sparkles, Flame, ArrowRight } from "lucide-react";
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
    };
  };
};

export default async function StudentProjectsPage() {
  const session = await auth();
  const studentUserId = getSessionUserIdByRole(session, "STUDENT");
  if (!studentUserId) return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;

  const profile = await findStudentProfileWithEmbedding(studentUserId);
  const availableProjects = await listStudentDiscoveryProjects(profile?.id ?? null);

  let invitations: StudentInvitation[] = [];
  if (profile) {
    invitations = await listStudentInvitations(profile.id);
  }

  type RankedProject = (typeof availableProjects)[number] & { matchScore: number };
  let rankedProjects: RankedProject[] = [];

  if (profile?.embedding && profile.embedding.length > 0) {
    rankedProjects = rankBySimilarity(profile.embedding, availableProjects) as RankedProject[];
  } else {
    rankedProjects = availableProjects.map(p => ({ ...p, matchScore: 0 }));
  }

  const presentedProjects = rankedProjects
    .map((project) =>
      presentStudentProjectSummary(project, {
        hasStudentProfile: Boolean(profile),
        matchScore: project.matchScore,
      }),
    )
    .filter((project) => project.interactionState !== "INVITED" && project.interactionState !== "ACCEPTED");

  return (
    <div className="space-y-10 pb-20 fade-in">
      {invitations.length > 0 && (
        <div className="mb-4">
          <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3 bg-red-500 w-fit text-white px-4 py-2 border-4 border-black shadow-neo-sm transform -rotate-1">
            <Flame className="w-8 h-8 fill-current text-yellow-300" /> THƯ CHÀO MỜI ĐỘC QUYỀN
          </h2>
          <div>
            {invitations.map(inv => (
              <InvitationCard key={inv.id} invitation={inv} />
            ))}
          </div>
        </div>
      )}

      {/* Brutalist Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-2 border-black bg-lime-300 p-8 md:p-10 shadow-neo-md rounded-lg">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black flex items-center">
            Việc làm gợi ý <Sparkles className="w-8 h-8 md:w-10 md:h-10 ml-3 text-black" />
          </h2>
          <p className="text-black font-semibold text-base mt-2 max-w-xl">
            Các bài toán từ doanh nghiệp được AI phân tích độ phù hợp với bộ kỹ năng của bạn.
          </p>
        </div>
      </div>

      {!profile?.embedding || profile.embedding.length === 0 ? (
        <div className="p-6 bg-yellow-300 border-4 border-black shadow-neo-sm text-black font-black uppercase flex flex-col md:flex-row md:items-center gap-4 transform rotate-1 hover:-rotate-1 transition-transform">
          <div className="text-5xl border-2 border-black bg-white rounded-full p-2 h-20 w-20 flex items-center justify-center -rotate-12 shadow-neo-sm">⚠️</div>
          <div className="text-sm md:text-base leading-snug">
            Bạn chưa chuẩn hóa kỹ năng trên hệ thống! <br className="hidden md:block"/>Hãy <Link href="/student/profile" className="underline decoration-4 underline-offset-4 bg-black text-white px-2 hover:bg-pink-400 hover:text-black transition-colors ml-1">cập nhật Profile</Link> ngay để AI có thể phân tích và gợi ý dự án đỉnh nhất cho bạn.
          </div>
        </div>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {presentedProjects.length === 0 ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-20 px-4 border-2 border-black bg-white shadow-neo-lg rounded-lg text-center transform hover:-translate-y-1 transition-transform">
            <h3 className="text-3xl md:text-4xl font-black mb-4 uppercase text-black">Rất tiếc!</h3>
            <p className="text-black font-bold text-lg max-w-md">Hiện chưa có dự án nào đang mở hoặc phù hợp với bạn. Hãy rèn luyện thêm kỹ năng và quay lại sau nhé.</p>
          </div>
        ) : presentedProjects.map((project, index) => {
          const bgColors = ["bg-lime-200", "bg-cyan-200", "bg-pink-200", "bg-yellow-200", "bg-violet-200", "bg-orange-200"];
          const cardBgColor = bgColors[index % bgColors.length];
          const hoverColor = cardBgColor.replace('bg-', 'hover:bg-');
          const isHighMatch = project.matchScore >= 80;
          const fitDescription = describeMatchScore(project.matchScore, {
            hasSignal: Boolean(profile?.embedding && profile.embedding.length > 0),
          });
          const canApply = project.interactionState === "READY_TO_APPLY";
          const applyDisabledReason = !profile
            ? "Bạn cần tạo hồ sơ sinh viên trước khi ứng tuyển."
            : undefined;

          return (
            <div 
              key={project.id} 
              className={`group flex flex-col ${cardBgColor} border-2 border-black rounded-lg shadow-neo-md hover:shadow-neo-lg transition-all hover:-translate-y-1 hover:-translate-x-1 divide-y-2 divide-black overflow-hidden relative`}
            >
              {/* AI Match Badge (Brutalist Sticker Style) */}
              {project.matchScore > 0 && (
                <div className={`absolute top-2 right-2 border-2 border-black px-3 py-1 font-black text-sm uppercase shadow-neo-sm transform rotate-6 transition-transform group-hover:rotate-12 z-10 ${isHighMatch ? 'bg-red-400 text-black' : 'bg-white text-black'}`}>
                  {project.matchScore}% Phù hợp
                </div>
              )}

              {/* Header Section */}
              <div className="p-5 bg-white pt-10">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="text-xs font-bold uppercase text-black flex items-center bg-gray-200 border-2 border-black px-2 py-1 shadow-neo-sm rounded-md">
                    <Building2 className="w-3 h-3 mr-1" /> {project.companyName}
                  </span>
                  {project.interactionState !== "READY_TO_APPLY" ? (
                    <ApplicationStatusBadge className="max-w-[160px] text-[10px]" state={project.interactionState} />
                  ) : null}
                </div>
                <h3 className="line-clamp-2 text-xl font-black uppercase tracking-tight text-black group-hover:underline decoration-4 underline-offset-4">
                  {project.title}
                </h3>
              </div>

              {/* Body Section */}
              <div className="p-5 flex-grow bg-white flex flex-col justify-between">
                <p className="line-clamp-3 text-sm font-semibold text-black/80 mb-4 leading-relaxed">
                  {project.expectedOutput}
                </p>

                {project.matchScore > 0 ? (
                  <p className="mb-4 text-xs font-black uppercase tracking-wide text-black/70">
                    {fitDescription.label}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.requiredSkills.slice(0, 3).map((skill: string) => (
                    <span key={skill} className="text-xs font-bold uppercase tracking-wider border-2 border-black px-2 py-1 bg-yellow-100 text-black shadow-neo-sm rounded-md">
                      {skill}
                    </span>
                  ))}
                  {project.requiredSkills.length > 3 && (
                    <span className="text-xs font-bold uppercase tracking-wider border-2 border-black px-2 py-1 bg-gray-200 text-black shadow-neo-sm rounded-md">
                      +{project.requiredSkills.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center text-xs font-black uppercase text-black border-2 border-black bg-white w-fit px-3 py-1.5 shadow-neo-sm rounded-md mt-auto">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  {project.duration}
                </div>
              </div>

              {/* Footer Section */}
              <div className="flex w-full divide-x-2 divide-black">
                <Link
                  className="flex h-16 flex-1 items-center justify-center bg-white px-4 text-sm font-black uppercase tracking-wide text-black transition-colors hover:bg-black hover:text-white"
                  href={`/student/projects/${project.id}`}
                >
                  Xem chi tiết <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                {canApply ? (
                  <ApplyButton 
                    className={`flex-1 bg-white text-black text-base ${hoverColor} transition-colors border-0 h-16 uppercase font-black`}
                    disabledReason={applyDisabledReason}
                    matchScore={project.matchScore}
                    projectId={project.id}
                  />
                ) : (
                  <div className="flex flex-1 items-center justify-center bg-white px-3 text-center text-xs font-black uppercase text-black/70">
                    Theo dõi trạng thái ở chi tiết
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
