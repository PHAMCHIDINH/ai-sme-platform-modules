import Link from "next/link";
import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { ACCESS_MESSAGES } from "@/modules/shared";
import { findSmeDashboardMetrics, findSmeDashboardProfile } from "@/modules/shared";
import { projectStatusClassName, projectStatusLabel } from "@/modules/project";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, DiscoveryMetricStrip } from "@/modules/shared/ui";
import { ArrowRight, Building2, FolderKanban, PlusCircle, UsersRound } from "lucide-react";

export default async function SMEDashboardPage() {
  const session = await auth();
  const smeUserId = getSessionUserIdByRole(session, "SME");

  if (!smeUserId) {
    return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;
  }

  const smeProfile = await findSmeDashboardProfile(smeUserId);

  if (!smeProfile) {
    return (
      <div className="space-y-6">
        <header className="portal-shell p-6 md:p-8">
          <p className="portal-kicker">SME workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">Tổng quan doanh nghiệp</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Tạo hồ sơ doanh nghiệp để bắt đầu đăng dự án và nhận danh sách ứng viên phù hợp.
          </p>
        </header>

        <Card className="!rounded-2xl !border !border-border/70 !bg-white !shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <Building2 className="h-12 w-12 text-slate-400" />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-900">Bạn chưa tạo hồ sơ doanh nghiệp</p>
              <p className="text-sm text-slate-500">Cập nhật thông tin để mở luồng đăng dự án và sourcing ứng viên.</p>
            </div>
            <Link href="/sme/profile">
              <Button className="rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800">Tạo hồ sơ doanh nghiệp</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { activeProjects, totalApplicants, recentProjects } = await findSmeDashboardMetrics(smeProfile.id);

  return (
    <div className="space-y-8">
      <header className="portal-shell p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="portal-kicker">SME workspace</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Pipeline dự án và ứng viên</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Theo dõi luồng dự án đang mở, số lượng ứng viên và hành động cần làm tiếp theo.
            </p>
          </div>
          <Link href="/sme/projects/new">
            <Button className="rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800">
              <PlusCircle className="h-4 w-4" /> Đăng dự án mới
            </Button>
          </Link>
        </div>
      </header>

      <DiscoveryMetricStrip
        metrics={[
          { label: "Tổng dự án", value: String(smeProfile._count.projects), helper: "Tính từ lúc tạo hồ sơ" },
          { label: "Đang diễn ra", value: String(activeProjects), helper: "Dự án chưa hoàn thành" },
          { label: "Ứng viên đang quan tâm", value: String(totalApplicants), helper: "Tổng đơn ứng tuyển" },
          { label: "Recent activity", value: String(recentProjects.length), helper: "Dự án cập nhật gần đây" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="!rounded-2xl !border !border-border/70 !bg-white !shadow-sm">
          <CardHeader className="space-y-2">
            <Badge className="w-fit rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700" variant="outline">
              Candidate sourcing
            </Badge>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UsersRound className="h-5 w-5 text-emerald-700" />
              Tìm ứng viên mới
            </CardTitle>
            <CardDescription>Truy cập luồng candidate discovery để mời trực tiếp sinh viên phù hợp.</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <Link href="/sme/students">
              <Button className="rounded-full border border-border bg-white text-slate-700 hover:bg-slate-50" variant="outline">
                Mở candidate discovery <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="!rounded-2xl !border !border-border/70 !bg-white !shadow-sm">
          <CardHeader className="space-y-2">
            <Badge className="w-fit rounded-full border border-sky-200 bg-sky-50 text-sky-700" variant="outline">
              Project intake
            </Badge>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FolderKanban className="h-5 w-5 text-sky-700" />
              Chuẩn hóa brief dự án
            </CardTitle>
            <CardDescription>Tạo brief rõ ràng để tăng chất lượng ứng viên được gợi ý.</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <Link href="/sme/projects/new">
              <Button className="rounded-full border border-border bg-white text-slate-700 hover:bg-slate-50" variant="outline">
                Tạo brief mới <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="!rounded-2xl !border !border-border/70 !bg-white !shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Dự án gần đây</CardTitle>
          <CardDescription>Theo dõi trạng thái mới nhất và số lượng ứng viên theo từng dự án.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-6">
          {recentProjects.length === 0 ? (
            <div className="rounded-xl border border-border/80 bg-slate-50 p-5 text-center">
              <p className="text-sm text-slate-500">Bạn chưa đăng dự án nào. Hãy tạo brief đầu tiên để bắt đầu pipeline.</p>
            </div>
          ) : (
            recentProjects.map((project) => (
              <div
                className="flex flex-col gap-3 rounded-xl border border-border/70 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                key={project.id}
              >
                <div className="space-y-1">
                  <Link className="text-sm font-semibold text-slate-900 hover:text-emerald-700 hover:underline" href={`/sme/projects/${project.id}`}>
                    {project.title}
                  </Link>
                  <p className="text-xs text-slate-500">Tạo ngày {new Date(project.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={projectStatusClassName(project.status)} variant="outline">
                    {projectStatusLabel(project.status)}
                  </Badge>
                  <span className="text-xs font-medium text-slate-500">{project._count.applications} ứng viên</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
