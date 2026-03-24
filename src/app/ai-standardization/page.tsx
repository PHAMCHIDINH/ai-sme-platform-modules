import Link from "next/link";
import { ArrowRight, MessageSquareCode, FileJson, Bolt, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/modules/shared/ui";
import { Badge } from "@/modules/shared/ui";
import { Navbar } from "@/components/layout/navbar";

export default function AIStandardizationPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-rose-50/50">
      <Navbar />

      <main className="page-wrap flex flex-1 flex-col gap-20 pb-20 pt-28 md:pt-36">
        
        {/* HERO SECTION */}
        <section className="relative text-center max-w-4xl mx-auto space-y-8">
          <Badge className="bg-rose-300 text-black border-2 border-black font-black uppercase shadow-neo-sm px-4 py-2 text-sm md:text-base">
            <Sparkles className="w-5 h-5 mr-2 inline-block -mt-1" />
            AI Business Analyst
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-black leading-tight">
            Biến Ý Tưởng Thô <br />
            Lý Thuyết Thành <span className="text-rose-600 bg-white border-4 border-black px-4 ml-2 shadow-neo-sm inline-block transform rotate-2">Bản Thiết Kế Kỹ Thuật</span>
          </h1>
          <p className="text-lg md:text-xl font-bold text-black/80 max-w-3xl mx-auto bg-white p-4 border-2 border-black border-dashed">
            Hệ thống AI Chat Brief Wizard thay thế một Business Analyst (BA) thực thụ, giúp Doanh nghiệp đào sâu nhu cầu và tự động viết tài liệu dự án (Brief) chuẩn chỉnh cho lập trình viên.
          </p>
        </section>

        {/* CÂU CHUYỆN "GIẤY NHÁP" */}
        <section className="grid lg:grid-cols-2 gap-8 border-4 border-black bg-white shadow-neo-lg p-0">
          <div className="bg-gray-100 p-8 md:p-12 border-b-4 lg:border-b-0 lg:border-r-4 border-black">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <h2 className="text-3xl font-black uppercase">Thực trạng SME</h2>
            </div>
            <div className="bg-yellow-100 border-2 border-dashed border-black p-6 font-mono text-sm relative">
              <span className="absolute -top-3 left-4 bg-white border-2 border-black px-2 text-xs font-bold uppercase">Yêu cầu từ Chủ Doanh Nghiệp</span>
              &quot;Em ơi làm cho anh cái app bán hàng giao diện đẹp đẹp giống Shopee nhé. Kinh phí tầm 5 triệu, tháng sau xong. Tính năng đơn giản thôi, có giỏ hàng, nạp thẻ, tích điểm, AI chatbot tư vấn...&quot;
            </div>
            <p className="mt-6 text-lg font-bold text-black/70">
              SME hiểu rất rõ họ muốn thu về lợi ích gì, nhưng lại <strong>thiếu từ vựng kỹ thuật</strong> để mô tả định lượng quy mô phần mềm. Hệ quả: Báo giá sai, làm sai yêu cầu, gãy đổ dự án giữa chừng.
            </p>
          </div>
          
          <div className="bg-rose-200 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Bolt className="w-8 h-8 text-rose-600" />
              <h2 className="text-3xl font-black uppercase text-rose-800">Giải pháp từ AI</h2>
            </div>
            <div className="bg-white border-4 border-black p-6 shadow-neo-sm">
              <div className="flex flex-col gap-3">
                 <div className="bg-gray-100 p-3 border-2 border-black rounded font-medium text-sm self-end max-w-[85%]">Anh cần làm app bán hàng giống Shopee.</div>
                 <div className="bg-rose-100 p-3 border-2 border-black rounded font-bold text-rose-800 text-sm self-start max-w-[85%]">Chào anh, để ứng dụng tối ưu nhất với 5M, anh muốn tập trung bán 1 loại sản phẩm (ví dụ: quần áo) hay đa ngành hàng ạ? Anh có cần tích hợp cổng thanh toán MoMo không?</div>
              </div>
            </div>
            <p className="mt-6 text-lg font-bold text-black/80">
              Thay vì bắt SME điền những form dài dằng dặc, <strong>AI Chat Wizard</strong> sẽ trò chuyện để bóc tách tệp khách hàng, ngân sách, và các tính năng bắt buộc.
            </p>
          </div>
        </section>

        {/* 3 BƯỚC KHÉP KÍN */}
        <section>
          <h2 className="text-4xl font-black uppercase mb-12 text-center">Tiến Trình Chuẩn Hóa Bằng AI</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-4 border-black bg-cyan-200 p-8 shadow-neo-md hover:-translate-y-2 transition-transform">
              <MessageSquareCode className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-black uppercase mb-4 bg-white px-2 border-2 border-black w-fit">Bước 1: Tương Tác</h3>
              <p className="text-lg font-medium leading-relaxed">
                Người dùng gõ các ý tưởng thô sơ vào khung Chat. AI phân tích ngầm và sử dụng Logic Tree để hỏi xoáy vào các lỗ hổng của dự án.
              </p>
            </div>

            <div className="border-4 border-black bg-lime-200 p-8 shadow-neo-md hover:-translate-y-2 transition-transform">
              <FileJson className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-black uppercase mb-4 bg-white px-2 border-2 border-black w-fit">Bước 2: Bóc Tách (JSON)</h3>
              <p className="text-lg font-medium leading-relaxed">
                Khi thu thập đủ thông tin, AI Parser sẽ tự động bóc tách hội thoại thành các trường dữ liệu tĩnh: <code>{"{ skills: [], duration: '...', features: [] }"}</code>.
              </p>
            </div>

            <div className="border-4 border-black bg-violet-200 p-8 shadow-neo-md hover:-translate-y-2 transition-transform">
              <Sparkles className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-black uppercase mb-4 bg-white px-2 border-2 border-black w-fit">Bước 3: Xuất Tài Liệu</h3>
              <p className="text-lg font-medium leading-relaxed">
                Từ tập JSON, hệ thống sinh ra một <strong>Technical & Feature Brief</strong> chuyên nghiệp. Sinh viên IT nhìn vào là biết ngay cần code bằng ngôn ngữ gì, kiến trúc ra sao.
              </p>
            </div>
          </div>
        </section>

        <section className="text-center bg-black text-white p-12 border-4 border-black shadow-[8px_8px_0_theme(colors.rose.400)]">
          <h2 className="text-3xl md:text-5xl font-black uppercase mb-8">Viết Yêu Cầu Dự Án Chưa Bao Giờ Dễ Đến Thế</h2>
          <p className="text-xl font-bold mb-8 text-rose-200">Hãy để AI của VnSMEMatch làm cầu nối ngôn ngữ giữa Kinh Doanh và Kỹ Thuật.</p>
          <Link href="/register?role=sme">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 border-4 border-black shadow-[4px_4px_0_theme(colors.rose.400)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all h-16 px-10 text-xl font-black uppercase">
              Thử Nghiệm AI Wizard Ngay <ArrowRight className="ml-3 w-6 h-6" />
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
