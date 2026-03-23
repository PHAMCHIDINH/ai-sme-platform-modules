import { auth } from "@/auth";
import { Button } from "@/modules/shared/ui";
import { Badge } from "@/modules/shared/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui";
import {
  ArrowRight,
  CheckCircle2,
  Building2,
  GraduationCap,
  Zap,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect(session.user.role === "SME" ? "/sme/dashboard" : "/student/dashboard");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Navbar />

      <main className="page-wrap flex flex-1 flex-col gap-20 pb-16 pt-28 md:pt-32">
        <section className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <Badge className="bg-lime-200">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Kết nối thực chiến thật
            </Badge>

            <h1 className="text-balance text-4xl font-black leading-tight md:text-6xl">
              Nơi <span className="bg-violet-200 px-2">Sinh viên IT</span> gặp bài toán thật từ
              <span className="bg-pink-200 px-2"> SME Việt Nam</span>
            </h1>

            <p className="max-w-2xl text-lg font-medium text-foreground/80">
              VnSMEMatch giúp doanh nghiệp đăng nhu cầu số hóa, AI chuẩn hóa brief và gợi ý ứng viên phù hợp.
              Sinh viên xây portfolio thật qua các dự án có đầu ra rõ ràng.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/register?role=student">
                <Button size="lg" className="bg-violet-200 hover:bg-violet-300">
                  <GraduationCap className="h-5 w-5" /> Tôi là Sinh viên
                </Button>
              </Link>
              <Link href="/register?role=sme">
                <Button size="lg" variant="secondary" className="bg-cyan-200 hover:bg-cyan-300">
                  <Building2 className="h-5 w-5" /> Tôi là Doanh nghiệp
                </Button>
              </Link>
            </div>
          </div>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl">Bảng điều phối dự án mẫu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              <div className="rounded-md border-2 border-black bg-yellow-200 p-4 shadow-neo-sm">
                <p className="text-sm font-extrabold uppercase tracking-[0.08em]">Project #SME-28</p>
                <p className="mt-1 text-sm font-medium">Xây hệ thống quản lý kho mini cho cửa hàng bán lẻ.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border-2 border-black bg-pink-200 p-3 shadow-neo-sm">
                  <p className="text-xs font-extrabold uppercase">Ứng viên phù hợp</p>
                  <p className="text-2xl font-black">12</p>
                </div>
                <div className="rounded-md border-2 border-black bg-cyan-200 p-3 shadow-neo-sm">
                  <p className="text-xs font-extrabold uppercase">Đang triển khai</p>
                  <p className="text-2xl font-black">4</p>
                </div>
              </div>
              <div className="rounded-md border-2 border-black bg-violet-200 p-3 text-sm font-semibold shadow-neo-sm">
                AI Matching score trung bình: <span className="font-black">86%</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="benefits" className="rounded-md border-2 border-black bg-white p-6 shadow-neo-md md:p-8">
          <p className="mb-5 text-sm font-extrabold uppercase tracking-[0.08em] text-foreground/70">Được tin dùng bởi</p>
          <div className="flex flex-wrap items-center gap-6 text-sm font-black uppercase md:gap-10">
            <span className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-yellow-200 px-3 py-2 shadow-neo-sm">
              <Zap className="h-4 w-4" /> TechStartup
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-pink-200 px-3 py-2 shadow-neo-sm">
              <Target className="h-4 w-4" /> SMESolutions
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-lime-200 px-3 py-2 shadow-neo-sm">
              <Users className="h-4 w-4" /> EduConnect
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-cyan-200 px-3 py-2 shadow-neo-sm">
              <Building2 className="h-4 w-4" /> VNRetail
            </span>
          </div>
        </section>

        <section id="features" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black md:text-5xl">Giải pháp Win-Win cho cả SME và Sinh viên</h2>
            <p className="max-w-3xl text-base font-medium text-foreground/80">
              AI hỗ trợ chuẩn hóa yêu cầu, đánh giá mức độ phù hợp và theo dõi tiến độ dự án theo từng cột mốc.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-yellow-200/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Building2 className="h-6 w-6" /> Dành cho Doanh nghiệp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                {[
                  "Đăng dự án số hóa nhanh với mẫu brief có AI hỗ trợ.",
                  "Nhận danh sách ứng viên đã chấm điểm phù hợp theo kỹ năng.",
                  "Theo dõi tiến độ trực quan và nghiệm thu đúng mốc.",
                  "Tích lũy dữ liệu tuyển cộng tác viên cho các dự án sau.",
                ].map((item) => (
                  <p key={item} className="flex items-start gap-2 text-sm font-medium">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{item}</span>
                  </p>
                ))}
                <Button variant="link" className="mt-2">
                  Tìm hiểu thêm <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-cyan-200/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <GraduationCap className="h-6 w-6" /> Dành cho Sinh viên
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                {[
                  "Nhận gợi ý dự án phù hợp kỹ năng và định hướng nghề nghiệp.",
                  "Làm việc thực tế với doanh nghiệp qua các yêu cầu thật.",
                  "Xây portfolio có minh chứng, review và kết quả đầu ra.",
                  "Nhận đánh giá năng lực sau từng project đã hoàn thành.",
                ].map((item) => (
                  <p key={item} className="flex items-start gap-2 text-sm font-medium">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{item}</span>
                  </p>
                ))}
                <Button variant="link" className="mt-2">
                  Bắt đầu ngay <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-black bg-white py-10">
        <div className="page-wrap grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="mb-2 text-xl font-black">
              VnSME<span className="text-violet-700">Match</span>
            </p>
            <p className="max-w-sm text-sm font-medium text-foreground/80">
              Nền tảng kết nối sinh viên IT với nhu cầu chuyển đổi số thực tế từ doanh nghiệp vừa và nhỏ.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-extrabold uppercase tracking-[0.08em]">Sản phẩm</h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li><span>Đăng dự án</span></li>
              <li><span>Tìm ứng viên</span></li>
              <li><span>Tạo hồ sơ</span></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-extrabold uppercase tracking-[0.08em]">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li><span>Hướng dẫn</span></li>
              <li><span>Chính sách</span></li>
              <li><span>Liên hệ</span></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
