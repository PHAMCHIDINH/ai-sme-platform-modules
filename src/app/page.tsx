import { auth } from "@/auth";
import { Navbar } from "@/components/layout/navbar";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DiscoveryMetricStrip,
  PortalSearchHero,
} from "@/modules/shared/ui";
import { ArrowRight, BookOpen, Building2, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const heroMetrics = [
  { label: "Dự án đang mở", value: "128+", helper: "Bài toán thật từ SME" },
  { label: "SME tham gia", value: "70+", helper: "Từ bán lẻ đến dịch vụ" },
  { label: "Sinh viên hoạt động", value: "540+", helper: "Đang xây portfolio thực chiến" },
  { label: "Tỷ lệ hoàn thành", value: "84%", helper: "Dự án có đầu ra rõ ràng" },
];

const browseLinks = [
  { label: "Web App", href: "/student/projects" },
  { label: "Automation", href: "/student/projects" },
  { label: "Data Analysis", href: "/student/projects" },
  { label: "AI Workflow", href: "/student/projects" },
  { label: "Operations", href: "/student/projects" },
  { label: "Customer Growth", href: "/student/projects" },
];

const featuredTracks = [
  {
    title: "Discovery cho Sinh viên",
    description: "Lọc theo kỹ năng, độ khó, thời lượng và trạng thái tuyển để tìm dự án phù hợp.",
    href: "/student/projects",
    icon: BookOpen,
    badge: "For Students",
  },
  {
    title: "Sourcing cho SME",
    description: "Tìm ứng viên theo năng lực, mời hợp tác và theo dõi pipeline trong một luồng nhất quán.",
    href: "/sme/students",
    icon: Users,
    badge: "For SMEs",
  },
  {
    title: "AI Matching Layer",
    description: "Chuẩn hóa brief và diễn giải mức độ phù hợp để ra quyết định nhanh hơn.",
    href: "/ai-standardization",
    icon: Sparkles,
    badge: "AI Assisted",
  },
];

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect(session.user.role === "SME" ? "/sme/dashboard" : "/student/dashboard");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Navbar />

      <main className="page-wrap flex flex-1 flex-col gap-10 pb-16 pt-28 md:gap-12 md:pt-32">
        <PortalSearchHero
          browseLinks={browseLinks}
          description="Khám phá dự án thực chiến từ SME, theo dõi mức độ phù hợp và bắt đầu hợp tác qua một workflow rõ ràng."
          eyebrow="SME x Student Career Portal"
          fields={[
            { id: "keyword", label: "Từ khóa", placeholder: "VD: React, CRM, automation, data pipeline..." },
            { id: "goal", label: "Mục tiêu dự án", placeholder: "VD: Tối ưu vận hành bán hàng, dashboard tài chính..." },
          ]}
          metrics={heroMetrics}
          primaryActionHref="/student/projects"
          primaryActionLabel="Khám phá dự án"
          secondaryActionHref="/register?role=sme"
          secondaryActionLabel="Đăng dự án cho SME"
          title="Nơi SME và sinh viên gặp nhau bằng dự án thật"
        />

        <DiscoveryMetricStrip
          metrics={[
            { label: "Match score trung bình", value: "86%", helper: "Sau khi chuẩn hóa brief" },
            { label: "Tỷ lệ phản hồi SME", value: "91%", helper: "Trong 72 giờ đầu" },
            { label: "Dự án đang triển khai", value: "34", helper: "Có nhật ký tiến độ" },
            { label: "Portfolio đã hoàn tất", value: "210+", helper: "Có feedback từ SME" },
          ]}
        />

        <section className="space-y-4">
          <div className="space-y-2">
            <p className="portal-kicker">Explore platform tracks</p>
            <h2 className="section-title">Một marketplace, hai luồng discovery đối xứng</h2>
            <p className="section-subtitle">
              Sinh viên khám phá dự án, SME khám phá ứng viên. Cả hai dùng cùng ngôn ngữ dữ liệu và hành động.
            </p>
          </div>

          <div className="portal-listing-grid">
            {featuredTracks.map((track) => (
              <Card className="!rounded-2xl !border !border-border/70 !bg-white !shadow-sm" key={track.title}>
                <CardHeader className="space-y-3">
                  <Badge className="w-fit rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700" variant="outline">
                    {track.badge}
                  </Badge>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <track.icon className="h-5 w-5 text-emerald-700" />
                    {track.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pb-6">
                  <p className="text-sm leading-6 text-slate-600">{track.description}</p>
                  <Link href={track.href}>
                    <Button className="rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800">
                      Truy cập luồng <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="portal-shell flex flex-col justify-between gap-5 p-6 md:flex-row md:items-center md:p-8">
          <div className="space-y-2">
            <p className="portal-kicker">Start now</p>
            <h3 className="text-2xl font-semibold text-slate-900 md:text-3xl">Bắt đầu với vai trò phù hợp của bạn</h3>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Student bắt đầu từ discovery và apply flow. SME bắt đầu từ đăng brief và sourcing flow.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register?role=student">
              <Button className="rounded-full border border-border bg-white text-slate-700 hover:bg-slate-50" variant="outline">
                Tôi là Sinh viên
              </Button>
            </Link>
            <Link href="/register?role=sme">
              <Button className="rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800">
                <Building2 className="h-4 w-4" /> Tôi là Doanh nghiệp
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
