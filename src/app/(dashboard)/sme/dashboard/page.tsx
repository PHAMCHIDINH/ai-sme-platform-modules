import Link from "next/link";
import { FolderKanban, Users, Clock, PlusCircle, Building2 } from "lucide-react";
import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { ACCESS_MESSAGES } from "@/modules/shared";
import { findSmeDashboardMetrics, findSmeDashboardProfile } from "@/modules/shared";
import { projectStatusClassName, projectStatusLabel } from "@/modules/project";
import { Badge } from "@/modules/shared/ui";
import { Button } from "@/modules/shared/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui";

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
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tổng quan Doanh nghiệp</h2>
          <p className="text-muted-foreground text-sm">
            Quản lý hiệu quả các bài toán chuyển đổi số của bạn
          </p>
        </div>

        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/60" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Bạn chưa tạo hồ sơ doanh nghiệp</p>
              <p className="text-sm text-muted-foreground">
                Cập nhật thông tin công ty để bắt đầu đăng dự án và nhận ứng viên.
              </p>
            </div>
            <Link href="/sme/profile">
              <Button>Tạo hồ sơ doanh nghiệp</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { activeProjects, totalApplicants, recentProjects } =
    await findSmeDashboardMetrics(smeProfile.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tổng quan Doanh nghiệp</h2>
          <p className="text-muted-foreground text-sm">Quản lý hiệu quả các bài toán chuyển đổi số của bạn</p>
        </div>
        <Link href="/sme/projects/new">
          <Button className="rounded-full shadow-md"><PlusCircle className="w-4 h-4 mr-2" /> Đăng dự án mới</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng dự án</CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smeProfile._count.projects}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đang diễn ra</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sinh viên ứng tuyển</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplicants}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Dự án gần đây</h3>
        {recentProjects.length === 0 ? (
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur flex flex-col items-center justify-center h-48 text-muted-foreground">
            <FolderKanban className="w-10 h-10 mb-4 opacity-20" />
            <p>Bạn chưa đăng dự án nào.</p>
            <Link href="/sme/projects/new">
              <Button variant="link" className="text-primary mt-2">Bắt đầu tạo dự án đầu tiên</Button>
            </Link>
          </Card>
        ) : (
          <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
            <CardContent className="p-0">
              <div className="divide-y">
                {recentProjects.map((project) => (
                  <div
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    key={project.id}
                  >
                    <div className="space-y-1">
                      <Link
                        className="font-semibold hover:text-primary hover:underline"
                        href={`/sme/projects/${project.id}`}
                      >
                        {project.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Tạo ngày {new Date(project.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={projectStatusClassName(project.status)} variant="outline">
                        {projectStatusLabel(project.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {project._count.applications} ứng viên
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
