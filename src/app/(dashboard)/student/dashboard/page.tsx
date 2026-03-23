import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { ACCESS_MESSAGES } from "@/modules/shared";
import { findStudentDashboardData } from "@/modules/shared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/modules/shared/ui";
import { Button } from "@/modules/shared/ui";
import Link from "next/link";
import { Layers, FolderKanban, Star, Award, Code2 } from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await auth();
  const studentUserId = getSessionUserIdByRole(session, "STUDENT");
  if (!studentUserId) return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;

  let profile:
    | {
        skills: string[];
        _count: { applications: number };
        progressEntries: { status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" }[];
      }
    | null = null;
  let avgRating = "Chưa có";

  try {
    const { profileResult, evaluationSummary } = await findStudentDashboardData(studentUserId);

    profile = profileResult;
    avgRating =
      evaluationSummary._count.overallFit > 0 && evaluationSummary._avg.overallFit !== null
        ? evaluationSummary._avg.overallFit.toFixed(1)
        : "Chưa có";
  } catch (error) {
    console.error("StudentDashboardPage load error:", error);
  }

  const activeProjects = profile?.progressEntries.filter(p => p.status !== "COMPLETED").length || 0;
  const completedProjects = profile?.progressEntries.filter(p => p.status === "COMPLETED").length || 0;
  const profileCompletion = profile?.skills.length ? 80 : 30;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tổng quan Cá nhân</h2>
          <p className="text-muted-foreground text-sm">Đo lường sự phát triển thực chiến của bạn</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-blue-50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">Đang thực hiện</CardTitle>
            <Layers className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{activeProjects}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đã ứng tuyển</CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?._count.applications || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hoàn thành</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đánh giá TB</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-baseline gap-1">
              {avgRating} <span className="text-sm font-normal text-muted-foreground">/ 5.0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Dự án AI gợi ý mới nhất</CardTitle>
            <CardDescription>Các dự án phù hợp với kỹ năng của bạn</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 min-h-[200px] text-center bg-muted/20 m-6 rounded-xl border border-dashed">
            <Code2 className="w-10 h-10 mb-4 text-indigo-400 opacity-50" />
            <p className="text-muted-foreground text-sm mb-4">Hệ thống có nhiều bài toán mới chờ bạn khám phá</p>
            <Link href="/student/projects">
              <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                Khám phá ngay
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Phát triển hồ sơ</CardTitle>
            <CardDescription>Trang bị tốt hơn cho AI Matching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/40 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Độ hoàn thiện Profile</span>
                <span className="text-sm font-bold text-primary">{profileCompletion}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
            {!profile?.skills.length && (
               <Link href="/student/profile" className="block mt-4">
                <Button className="w-full">Cập nhật kỹ năng để nhận gợi ý</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
