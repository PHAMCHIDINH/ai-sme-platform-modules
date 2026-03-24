import Link from "next/link";
import { ArrowRight, CheckSquare, ShieldCheck, Microscope, Medal, Target } from "lucide-react";
import { Button } from "@/modules/shared/ui";
import { Badge } from "@/modules/shared/ui";
import { Navbar } from "@/components/layout/navbar";

export default function QualityAssurancePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-orange-50/50">
      <Navbar />

      <main className="page-wrap flex flex-1 flex-col gap-20 pb-20 pt-28 md:pt-36">
        
        {/* HEADER */}
        <section className="text-center space-y-6">
          <Badge className="bg-lime-300 text-black border-2 border-black font-black uppercase shadow-neo-sm px-4 py-1 text-sm md:text-base">
            <ShieldCheck className="w-4 h-4 mr-2 inline-block -mt-1" />
            Quality Assurance (QA)
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-black leading-tight">
            Luồng Đánh Giá & <br className="hidden md:block" />
            <span className="bg-orange-300 px-4 mt-2 inline-block border-4 border-black shadow-neo-sm">Bảo Chứng Năng Lực</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl font-bold mt-4 text-black/80">
            Giái quyết triệt để nỗi lo &quot;Năng lực trên CV ảo&quot; của Doanh nghiệp bằng hệ thống Test đầu vào và đánh giá đa chiều minh bạch.
          </p>
        </section>

        {/* BÀI TOÁN & VẤN ĐỀ */}
        <section className="grid md:grid-cols-2 gap-8 border-4 border-black bg-white shadow-neo-lg p-0 overflow-hidden">
          <div className="bg-red-400 p-8 md:p-12 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col justify-center">
            <h2 className="text-3xl font-black uppercase mb-4 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
              Vấn Đề: CV &quot;Thổi Phồng&quot;
            </h2>
            <p className="text-lg font-bold">
              Công nghệ AI Vector Matching chỉ ghép nối dựa trên những gì sinh viên <strong>tự khai báo</strong>. Điều này mang lại rủi ro cho SME khi giao dự án thật cho những bạn năng lực thực tế chưa đạt yêu cầu, làm mất thời gian và chi phí của cả hai bên.
            </p>
          </div>
          <div className="bg-green-400 p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-black uppercase mb-4 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
              Giải Pháp: Quy Trình QA
            </h2>
            <p className="text-lg font-bold">
              Bắt buộc sinh viên trải qua <strong>Test Đầu Vào (Pre-Assessment)</strong> trước khi được cấp &quot;Huy hiệu Năng Lực&quot; (Verified Badge). Lọc phễu chất lượng ngay từ cửa ngõ để SME an tâm giao việc.
            </p>
          </div>
        </section>

        {/* QUY TRÌNH 4 BƯỚC */}
        <section>
          <h2 className="text-4xl font-black uppercase mb-12 text-center">4 Bước Lọc Phễu Nhân Tài</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Bước 1 */}
            <div className="border-4 border-black bg-cyan-200 p-6 shadow-neo-md hover:-translate-y-2 transition-transform relative">
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-white border-4 border-black rounded-full flex items-center justify-center font-black text-2xl shadow-neo-sm">
                1
              </div>
              <Target className="w-10 h-10 mb-4 text-black" />
              <h3 className="text-xl font-black uppercase mb-3 text-black rounded">Self-Assessment</h3>
              <p className="font-semibold text-sm leading-relaxed">
                Sinh viên điền hồ sơ năng lực, liệt kê các công nghệ (React, Node, Python...) và lĩnh vực chuyên môn.
              </p>
            </div>

            {/* Bước 2 */}
            <div className="border-4 border-black bg-pink-300 p-6 shadow-neo-md hover:-translate-y-2 transition-transform relative">
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-white border-4 border-black rounded-full flex items-center justify-center font-black text-2xl shadow-neo-sm">
                2
              </div>
              <CheckSquare className="w-10 h-10 mb-4 text-black" />
              <h3 className="text-xl font-black uppercase mb-3 text-black rounded">Platform Testing</h3>
              <p className="font-semibold text-sm leading-relaxed">
                Hệ thống yêu cầu làm <strong>bài Test kỹ năng tĩnh</strong> (Trắc nghiệm hoặc Coding Challenge) được sinh ra từ AI tương ứng với các kỹ năng đã khai báo.
              </p>
            </div>

            {/* Bước 3 */}
            <div className="border-4 border-black bg-yellow-300 p-6 shadow-neo-md hover:-translate-y-2 transition-transform relative">
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-white border-4 border-black rounded-full flex items-center justify-center font-black text-2xl shadow-neo-sm">
                3
              </div>
              <Medal className="w-10 h-10 mb-4 text-black" />
              <h3 className="text-xl font-black uppercase mb-3 text-black rounded">Verified Badging</h3>
              <p className="font-semibold text-sm leading-relaxed">
                Vượt qua bài test với điểm số chuẩn, sinh viên nhận huy hiệu <strong>&quot;Verified Talent&quot;</strong> hiển thị công khai trên hồ sơ, tăng điểm uy tín.
              </p>
            </div>

            {/* Bước 4 */}
            <div className="border-4 border-black bg-violet-300 p-6 shadow-neo-md hover:-translate-y-2 transition-transform relative">
               <div className="absolute -top-5 -left-5 w-12 h-12 bg-white border-4 border-black rounded-full flex items-center justify-center font-black text-2xl shadow-neo-sm">
                4
              </div>
              <Microscope className="w-10 h-10 mb-4 text-black" />
              <h3 className="text-xl font-black uppercase mb-3 text-black rounded">Quality Matching</h3>
              <p className="font-semibold text-sm leading-relaxed">
                Khi SME đăng dự án, họ có thể bật tùy chọn <strong>&quot;Chỉ nhận ứng viên Verified&quot;</strong>. AI sẽ tinh chỉnh trọng số để gợi ý nhân sự sát nhất thực tế.
              </p>
            </div>

          </div>
        </section>

        {/* LỢI ÍCH 2 CHIỀU ĐƯỢC CHỨNG MINH */}
        <section className="border-4 border-black bg-white p-8 md:p-12 shadow-neo-lg">
          <h2 className="text-3xl font-black uppercase mb-8 border-b-4 border-black pb-4">Giá Trị Cốt Lõi Lâu Dài</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-black mb-4 flex items-center bg-cyan-200 w-fit px-2 border-2 border-black">
                Cho Doanh Nghiệp (SME)
              </h3>
              <ul className="space-y-3 font-semibold list-disc list-inside">
                <li>Tiết kiệm 80% thời gian phỏng vấn kỹ thuật sàng lọc.</li>
                <li>Giảm thiểu rủi ro dự án gãy gánh giữa đường.</li>
                <li>Nắm bắt được báo cáo điểm số chi tiết từng phần kỹ năng của ứng viên trước khi quyết định mời.</li>
              </ul>
            </div>
            <div>
               <h3 className="text-2xl font-black mb-4 flex items-center bg-pink-200 w-fit px-2 border-2 border-black">
                Cho Sinh Viên (Học thuật)
              </h3>
              <ul className="space-y-3 font-semibold list-disc list-inside">
                <li>Biết được năng lực thị trường của mình đang ở đâu.</li>
                <li>Huy hiệu &quot;Verified&quot; là một điểm cộng cực lớn vào CV cá nhân sau này.</li>
                <li>Sự công bằng: Những sinh viên có năng lực thực sự sẽ nổi bật, tránh tình trạng bị &quot;chìm lấp&quot; bởi những hồ sơ ảo bóng bẩy.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* GỌI HÀNH ĐỘNG */}
        <section className="text-center bg-black text-white p-12 border-4 border-black shadow-[8px_8px_0_theme(colors.yellow.400)]">
          <h2 className="text-3xl md:text-4xl font-black uppercase mb-6">Trải Nghiệm Hệ Thống Sàng Lọc Ngay</h2>
          <Link href="/register">
            <Button size="lg" className="bg-lime-400 hover:bg-lime-500 text-black border-4 border-black shadow-[4px_4px_0_white] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all h-16 px-8 text-xl font-black uppercase">
              Tham Gia Nền Tảng <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </section>
        
      </main>

      <footer className="border-t-4 border-black bg-white py-6 text-center font-bold">
        <p>VnSMEMatch © 2026. Một dự án kết nối đầy tham vọng.</p>
      </footer>
    </div>
  );
}
