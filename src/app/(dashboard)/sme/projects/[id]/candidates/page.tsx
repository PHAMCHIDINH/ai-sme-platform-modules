import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { ACCESS_MESSAGES } from "@/modules/shared";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/modules/shared/ui";
import { Badge } from "@/modules/shared/ui";
import { ArrowLeft, Code2, GraduationCap, Sparkles, Users } from "lucide-react";
import { rankBySimilarity } from "@/modules/matching";
import { findProjectWithApplications, listApplicantProfilesByIds, listSuggestionProfilesExcludingIds } from "@/modules/shared";
import { CandidateActions } from "./candidate-actions";
import { InviteAction } from "./invite-action";

type ProjectApplication = {
  studentId: string;
  status: "PENDING" | "INVITED" | "ACCEPTED" | "REJECTED";
  initiatedBy: "SME" | "STUDENT";
};

export default async function CandidatesPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const smeUserId = getSessionUserIdByRole(session, "SME");
  if (!smeUserId) return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;

  const project = await findProjectWithApplications(params.id);

  if (!project) return notFound();
  if (project.sme.userId !== smeUserId) return <div>{ACCESS_MESSAGES.FORBIDDEN_PAGE}</div>;

  const applicantIds = project.applications.map((app) => app.studentId);
  const applicationMap = new Map(project.applications.map((app) => [app.studentId, app]));

  const applicantsPool = await listApplicantProfilesByIds(applicantIds);
  const suggestionsPool = await listSuggestionProfilesExcludingIds(applicantIds);

  const applicants = rankBySimilarity(project.embedding, applicantsPool).map((student) => ({
    ...student,
    applicationData: applicationMap.get(student.id),
  }));
  const suggestions = rankBySimilarity(project.embedding, suggestionsPool).slice(0, 5);

  return (
    <div className="space-y-8 pb-12 fade-in">
      <header className="portal-shell p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="portal-kicker">Candidate pipeline</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Ứng viên cho dự án {project.title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Xem danh sách ứng tuyển, so sánh độ phù hợp kỹ năng và gửi lời mời trực tiếp cho các hồ sơ tiềm năng.
            </p>
          </div>
          <Link href={`/sme/projects/${project.id}`}>
            <Button className="rounded-full border border-border bg-white text-slate-700 hover:bg-slate-50" variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Quay lại chi tiết dự án
            </Button>
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-slate-700" />
          <h2 className="text-xl font-semibold text-slate-900">Sinh viên đã ứng tuyển ({applicants.length})</h2>
        </div>
        {applicants.length === 0 ? (
          <div className="portal-panel p-8 text-center">
            <p className="text-sm leading-6 text-slate-500">Chưa có sinh viên nào ứng tuyển dự án này.</p>
          </div>
        ) : (
          <div className="portal-listing-grid">
            {applicants.map(student => (
              <StudentCard
                key={student.id}
                projectId={project.id}
                student={student}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
          <h2 className="text-xl font-semibold text-slate-900">Gợi ý AI ({suggestions.length})</h2>
          <Badge className="rounded-full border border-amber-200 bg-amber-50 text-amber-700" variant="outline">
            Top match
          </Badge>
        </div>
        <div className="portal-listing-grid">
          {suggestions.map(student => (
            <StudentCard
              key={student.id}
              projectId={project.id}
              student={student}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

type CandidateStudent = {
  id: string;
  user: {
    name: string;
  };
  university: string;
  skills: string[];
  avatarUrl?: string | null;
  embedding: number[];
  matchScore: number;
  applicationData?: ProjectApplication;
};

function matchTone(matchScore: number) {
  if (matchScore >= 80) return "text-emerald-700";
  if (matchScore >= 60) return "text-amber-700";
  return "text-slate-500";
}

function statusBlock(applicationData?: ProjectApplication) {
  if (!applicationData) return null;

  if (applicationData.status === "INVITED") {
    return "Đã gửi lời mời";
  }

  if (applicationData.status === "ACCEPTED") {
    return "Đã nhận vào dự án";
  }

  if (applicationData.status === "REJECTED") {
    return "Đã từ chối";
  }

  return null;
}

function StudentCard({ student, projectId }: { student: CandidateStudent; projectId: string }) {
  const matchScore = student.matchScore;
  const blockingStatus = statusBlock(student.applicationData);

  return (
    <article className="portal-panel p-5">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 items-center">
            {student.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={`Ảnh đại diện của ${student.user.name}`}
                className="h-12 w-12 rounded-full border border-emerald-200 object-cover"
                src={student.avatarUrl}
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-lg font-semibold text-emerald-700">
                {student.user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-slate-900">{student.user.name}</h3>
              <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                <GraduationCap className="h-3.5 w-3.5" />
                {student.university || "Chưa cập nhật trường"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-2xl font-semibold ${matchTone(matchScore)}`}>{matchScore}%</span>
            <span className="text-[10px] uppercase tracking-[0.08em] text-slate-500">Độ phù hợp</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            <Code2 className="h-3.5 w-3.5" />
            Kỹ năng nổi bật
          </p>
          <div className="flex flex-wrap gap-1.5">
            {student.skills && student.skills.length > 0 ? (
              student.skills.slice(0, 4).map((skill: string) => (
                <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700" key={skill} variant="outline">
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-xs italic text-slate-500">Chưa cập nhật kỹ năng</span>
            )}
            {student.skills && student.skills.length > 4 ? (
              <Badge className="rounded-full border border-border bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600" variant="outline">
                +{student.skills.length - 4}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2">
          {student.applicationData?.status === "PENDING" ? (
            <CandidateActions projectId={projectId} studentId={student.id} />
          ) : null}

          {!student.applicationData ? (
            <InviteAction projectId={projectId} studentId={student.id} />
          ) : null}

          {blockingStatus ? (
            <div className="inline-flex h-10 w-full items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
              {blockingStatus}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
