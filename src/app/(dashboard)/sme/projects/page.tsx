import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { ACCESS_MESSAGES } from "@/modules/shared";
import { listSmeProjectsByUserId } from "@/modules/shared";
import { projectStatusLabel } from "@/modules/project";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge, Button, DiscoveryResultCard } from "@/modules/shared/ui";
import { ArrowRight, BriefcaseBusiness, CalendarDays, PlusCircle, Users } from "lucide-react";

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

export default async function SMEProjectsPage() {
  const session = await auth();
  const smeUserId = getSessionUserIdByRole(session, "SME");

  if (!smeUserId) {
    return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;
  }

  const projects = await listSmeProjectsByUserId(smeUserId);

  return (
    <div className="space-y-8 pb-12 fade-in">
      <header className="portal-shell p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="portal-kicker">SME workspace</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Danh mục dự án đang quản lý</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Theo dõi trạng thái dự án, số lượng ứng viên và điều phối các bước từ tuyển chọn đến nghiệm thu.
            </p>
          </div>
          <Link href="/sme/projects/new">
            <Button className="h-11 rounded-full border-0 bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800">
              <PlusCircle className="h-4 w-4" />
              Tạo dự án mới
            </Button>
          </Link>
        </div>
      </header>

      {projects.length === 0 ? (
        <section className="portal-panel flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
            <BriefcaseBusiness className="h-6 w-6 text-emerald-700" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Chưa có dự án nào được đăng</h2>
          <p className="max-w-md text-sm leading-6 text-slate-500">
            Tạo dự án đầu tiên để nhận đề xuất ứng viên phù hợp và bắt đầu quy trình làm việc với sinh viên.
          </p>
          <Link href="/sme/projects/new">
            <Button className="h-11 rounded-full border-0 bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800">
              Tạo brief dự án
            </Button>
          </Link>
        </section>
      ) : (
        <section className="portal-listing-grid">
          {projects.map((project) => (
            <DiscoveryResultCard
              actions={
                <>
                  <Link href={`/sme/projects/${project.id}`}>
                    <Button className="rounded-full border border-border bg-white text-slate-700 hover:bg-slate-50" variant="outline">
                      Xem chi tiết <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/sme/projects/${project.id}/candidates`}>
                    <Button className="rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800">
                      Ứng viên
                    </Button>
                  </Link>
                </>
              }
              badges={
                <>
                  {project.requiredSkills.slice(0, 3).map((skill) => (
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
              eyebrow="SME project"
              key={project.id}
              metadata={
                <>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: vi })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {project._count.applications} ứng viên
                  </span>
                  <Badge className={`rounded-full border px-3 font-semibold ${projectStatusTone(project.status)}`} variant="outline">
                    {projectStatusLabel(project.status)}
                  </Badge>
                </>
              }
              score={`${project._count.applications} candidates`}
              summary={project.description}
              title={project.title}
            />
          ))}
        </section>
      )}
    </div>
  );
}
