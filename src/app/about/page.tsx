import Link from "next/link";
import { ArrowRight, BrainCircuit, Rocket, Target, Users, Code, Zap, Lightbulb } from "lucide-react";
import { Button } from "@/modules/shared/ui";
import { Badge } from "@/modules/shared/ui";
import { Navbar } from "@/components/layout/navbar";

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-yellow-50/50">
      <Navbar />

      <main className="page-wrap flex flex-1 flex-col gap-20 pb-20 pt-28 md:pt-36">
        {/* HERO SECTION */}
        <section className="relative">
          <div className="border-4 border-black bg-emerald-300 p-8 shadow-neo-lg md:p-16 flex flex-col items-center text-center transform -rotate-1 hover:rotate-0 transition-transform">
            <Badge className="bg-white text-black border-2 border-black font-black uppercase text-sm mb-6 shadow-neo-sm px-4 py-1">
              VnSMEMatch là gì?
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-black mb-6 leading-tight">
              Sứ mệnh kết nối <br className="hidden md:block"/>
              <span className="bg-white px-3 underline decoration-8 underline-offset-4 decoration-pink-500">nhân tài số</span> và <span className="bg-white px-3 underline decoration-8 underline-offset-4 decoration-violet-500">SME Việt</span>
            </h1>
            <p className="max-w-2xl text-lg md:text-xl font-bold mt-4 text-black/80">
              Giải pháp đột phá xóa nhòa ranh giới giữa lý thuyết giảng đường và bài toán kinh doanh thức tế, vận hành hoàn toàn bởi trí tuệ nhân tạo (AI).
            </p>
          </div>
        </section>

        {/* VISION & MISSION */}
        <section className="grid gap-8 md:grid-cols-2">
          <div className="border-4 border-black bg-pink-300 p-8 shadow-neo-md hover:-translate-y-2 transition-transform">
            <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-neo-sm">
              <Target className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-3xl font-black uppercase mb-4">Nỗi Đau Thực Tại</h2>
            <p className="text-lg font-medium leading-relaxed">
              Các doanh nghiệp vừa và nhỏ (SME) chật vật chuyển đổi số vì <strong>chi phí nhân sự quá đắt đỏ</strong>. Trong khi đó, sinh viên IT ra trường lại <strong>thiếu kinh nghiệm thực chiến</strong> do mãi luẩn quẩn với các bài tập lớn mô phỏng xa rời thực tế.
            </p>
          </div>
          
          <div className="border-4 border-black bg-cyan-300 p-8 shadow-neo-md hover:-translate-y-2 transition-transform">
            <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-neo-sm">
              <Rocket className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-3xl font-black uppercase mb-4">Sứ Mệnh Của Chúng Tôi</h2>
            <p className="text-lg font-medium leading-relaxed">
              VnSMEMatch tạo ra một sàn giao dịch Win-Win nơi doanh nghiệp được đóng gói yêu cầu miễn phí bằng AI và tiếp cận sinh viên giỏi. Ngược lại, sinh viên tự xây dựng <strong>Portfolio thực tế 100%</strong> để tiến bước vào sự nghiệp.
            </p>
          </div>
        </section>

        {/* CORE AI TECH */}
        <section className="border-4 border-black bg-white p-8 md:p-12 shadow-neo-lg relative">
          <div className="absolute top-0 right-0 p-4 border-b-4 border-l-4 border-black bg-yellow-300 shadow-neo-sm">
            <BrainCircuit className="w-12 h-12 animate-pulse text-black" />
          </div>
          
          <h2 className="text-4xl font-black uppercase mb-10 w-fit border-b-8 border-violet-400 pb-2">Bộ Não AI Đằng Sau</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Lightbulb,
                title: "AI Chat Brief Wizard",
                desc: "Đập tan nỗi sợ 'không biết viết yêu cầu'. AI đóng vai trò như một chuyên gia BA (Bussiness Analyst) trò chuyện và tự động điền form dự án cho doanh nghiệp.",
                color: "bg-orange-200"
              },
              {
                icon: Zap,
                title: "Vector Matching",
                desc: "Công nghệ nhúng (Embeddings) phân tích độ tương đồng ngữ nghĩa giữa yêu cầu dự án và bộ kỹ năng sinh viên, đưa ra điểm số Match Score tính bằng % cực chuẩn xác.",
                color: "bg-blue-200"
              },
              {
                icon: Code,
                title: "AI Standardization",
                desc: "Tự động chuẩn hóa văn phong thô ráp của chủ doanh nghiệp thành một tài liệu kỹ thuật (Brief) chuyên nghiệp, có cấu trúc chặt chẽ để sinh viên dễ đọc hiểu.",
                color: "bg-lime-200"
              }
            ].map((tech, idx) => (
              <div key={idx} className={`border-2 border-black p-6 ${tech.color} shadow-neo-sm flex flex-col items-start`}>
                <span className="p-2 bg-white border-2 border-black rounded-md shadow-neo-sm mb-4">
                  <tech.icon className="w-6 h-6 text-black" />
                </span>
                <h3 className="text-xl font-black uppercase mb-2">{tech.title}</h3>
                <p className="font-semibold text-black/80">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TEAM / CONTEXT */}
        <section className="flex flex-col md:flex-row items-center justify-between border-4 border-black bg-violet-300 p-8 md:p-12 shadow-neo-lg gap-8">
          <div className="flex-1">
            <h2 className="text-4xl font-black uppercase mb-4 text-black">Về Nhóm Phát Triển</h2>
            <p className="text-xl font-bold bg-white p-1 inline-block border-2 border-black rotate-1">
              &quot;Build with ♥️ and AI for Vietnamese Students&quot;
            </p>
            <p className="mt-6 text-lg font-medium max-w-xl">
              Dự án này được lên ý tưởng và hiện thực hóa như một mô hình sàn giao dịch <strong>Niche B2C/B2B</strong> nhằm thử nghiệm sức mạnh của AI trong việc thay thế nhân sự trung gian (BA, Headhunter).
            </p>
          </div>
          <div className="bg-white p-6 border-4 border-black shadow-neo-md w-full md:w-auto -rotate-2">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-black uppercase text-center mb-2">Đồng Hành</h3>
            <p className="text-center font-bold">Dự án Capstone / Đồ án khởi nghiệp</p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pb-10">
          <h2 className="text-3xl font-black uppercase mb-6">Bạn đã sẵn sàng gia nhập cộng đồng?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register?role=sme">
              <Button size="lg" className="bg-cyan-400 hover:bg-cyan-500 text-black border-4 border-black shadow-neo-md h-16 px-8 text-xl font-black uppercase">
                Đăng Dự Án Ngay
              </Button>
            </Link>
            <Link href="/register?role=student">
              <Button size="lg" variant="secondary" className="bg-yellow-400 hover:bg-yellow-500 text-black border-4 border-black shadow-neo-md h-16 px-8 text-xl font-black uppercase">
                Khám Phá Cơ Hội <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      {/* Mini footer */}
      <footer className="border-t-4 border-black bg-white py-6 text-center font-bold">
        <p>VnSMEMatch © 2026. Một dự án kết nối đầy tham vọng.</p>
      </footer>
    </div>
  );
}
