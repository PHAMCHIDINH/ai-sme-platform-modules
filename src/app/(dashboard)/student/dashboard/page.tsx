import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { ACCESS_MESSAGES } from "@/modules/shared";
import { findStudentDashboardData } from "@/modules/shared";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, DiscoveryMetricStrip } from "@/modules/shared/ui";
import { ArrowRight, BookOpen, Sparkles, Star } from "lucide-react";
import Link from "next/link";

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

  const activeProjects = profile?.progressEntries.filter((entry) => entry.status !== "COMPLETED").length || 0;
  const completedProjects = profile?.progressEntries.filter((entry) => entry.status === "COMPLETED").length || 0;
  const profileCompletion = profile?.skills.length ? 80 : 30;

  return (
    <div className="space-y-8">
      <header className="portal-shell p-6 md:p-8">
        <div className="space-y-2">
          <p className="portal-kicker">Student workspace</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Tổng quan hành trình thực chiến</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Theo dõi tiến độ dự án, mức độ hoàn thiện hồ sơ và các gợi ý tiếp theo để nâng chất lượng portfolio.
          </p>
        </div>
      </header>

      <DiscoveryMetricStrip
        metrics={[
          { label: "Dự án đang thực hiện", value: String(activeProjects), helper: "Bao gồm IN_PROGRESS và SUBMITTED" },
          { label: "Đơn đã ứng tuyển", value: String(profile?._count.applications || 0), helper: "Từ luồng discovery" },
          { label: "Dự án hoàn thành", value: String(completedProjects), helper: "Đã có đầu ra" },
          { label: "Đánh giá trung bình", value: `${avgRating}${avgRating === "Chưa có" ? "" : "/5"}`, helper: "Từ SME" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="!rounded-2xl !border !border-border/70 !bg-white !shadow-sm">
          <CardHeader className="space-y-2">
            <Badge className="w-fit rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700" variant="outline">
              Recommended
            </Badge>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-emerald-700" />
              Dự án gợi ý mới nhất
            </CardTitle>
            <CardDescription>Khám phá các project phù hợp kỹ năng và mục tiêu nghề nghiệp.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <div className="rounded-xl border border-border/80 bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-600">
                Danh sách được ưu tiên theo mức tương đồng kỹ năng và trạng thái tuyển đang mở.
              </p>
            </div>
            <Link href="/student/projects">
              <Button className="rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800">
                Mở trang discovery <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="!rounded-2xl !border !border-border/70 !bg-white !shadow-sm">
          <CardHeader className="space-y-2">
            <Badge className="w-fit rounded-full border border-sky-200 bg-sky-50 text-sky-700" variant="outline">
              Readiness
            </Badge>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-sky-700" />
              Mức độ sẵn sàng hồ sơ
            </CardTitle>
            <CardDescription>Hồ sơ đầy đủ hơn sẽ giúp hệ thống match chính xác hơn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <div className="rounded-xl border border-border/80 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Profile completion</span>
                <span className="text-sm font-semibold text-slate-900">{profileCompletion}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
            {!profile?.skills.length ? (
              <Link href="/student/profile">
                <Button className="rounded-full border border-border bg-white text-slate-700 hover:bg-slate-50" variant="outline">
                  Cập nhật kỹ năng ngay
                </Button>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                <Star className="h-4 w-4" /> Hồ sơ đã có tín hiệu match
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
