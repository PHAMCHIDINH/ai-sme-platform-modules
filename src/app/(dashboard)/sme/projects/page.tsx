import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { ACCESS_MESSAGES } from "@/modules/shared";
import { listSmeProjectsByUserId } from "@/modules/shared";
import { projectStatusClassName, projectStatusLabel } from "@/modules/project";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/modules/shared/ui";
import { Badge } from "@/modules/shared/ui";
import { CalendarDays, PlusCircle, Users } from "lucide-react";

export default async function SMEProjectsPage() {
  const session = await auth();
  const smeUserId = getSessionUserIdByRole(session, "SME");

  if (!smeUserId) {
    return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;
  }

  const projects = await listSmeProjectsByUserId(smeUserId);

  return (
    <div className="space-y-10 mb-20 fade-in">
      {/* Brutalist Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-2 border-black bg-cyan-200 p-8 md:p-10 shadow-neo-md rounded-lg">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black">Dự án của tôi</h2>
          <p className="text-black font-semibold text-base mt-2 max-w-xl">
            Quản lý và theo dõi tiến độ các dự án đã đăng tải. Đăng thêm bài toán thực chiến để tìm kiếm nhân tài.
          </p>
        </div>
        <Link href="/sme/projects/new" className="shrink-0">
          <Button size="lg" className="text-base font-black uppercase bg-yellow-300 hover:bg-yellow-400 border-2 border-black shadow-neo-md px-8 h-14 w-full md:w-auto">
            <PlusCircle className="w-6 h-6 mr-2" /> Tạo dự án mới
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-black bg-yellow-300 shadow-neo-lg rounded-lg text-center transform transition-transform hover:-translate-y-1">
          <div className="w-24 h-24 bg-white border-4 border-black shadow-neo-md rounded-full flex items-center justify-center mb-6 transform -rotate-12">
            <PlusCircle className="w-12 h-12 text-black" />
          </div>
          <h3 className="text-3xl md:text-4xl font-black mb-4 uppercase text-black">Chưa có dự án nào!</h3>
          <p className="text-black font-bold text-lg mb-8 max-w-md">
            Hãy đăng bài toán số hóa đầu tiên của doanh nghiệp bạn ngay hôm nay để thu hút các ứng viên xuất sắc.
          </p>
          <Link href="/sme/projects/new">
            <Button size="lg" className="text-lg bg-pink-300 hover:bg-pink-400 border-2 border-black shadow-neo-md px-10 h-16 uppercase font-black">
              Đăng dự án ngay
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const bgColors = ["bg-lime-200", "bg-pink-200", "bg-violet-200", "bg-yellow-200", "bg-red-200", "bg-orange-200"];
            const cardBgColor = bgColors[index % bgColors.length];
            
            return (
              <div 
                key={project.id} 
                className={`group flex flex-col ${cardBgColor} border-2 border-black rounded-lg shadow-neo-md hover:shadow-neo-lg transition-all hover:-translate-y-1 hover:-translate-x-1 divide-y-2 divide-black overflow-hidden`}
              >
                {/* Header Section */}
                <div className="p-5 bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className={`border-2 border-black bg-white uppercase font-black px-3 py-1 shadow-neo-sm text-xs ${
                        projectStatusClassName(project.status)
                    }`}>
                      {projectStatusLabel(project.status)}
                    </Badge>
                    <span className="text-xs font-bold text-black border-2 border-black px-2 py-1 bg-gray-100 rounded-md shadow-neo-sm flex items-center">
                      <CalendarDays className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: vi })}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-xl font-black uppercase tracking-tight text-black group-hover:underline decoration-4 underline-offset-4">
                    <Link href={`/sme/projects/${project.id}`}>{project.title}</Link>
                  </h3>
                  <p className="line-clamp-2 mt-3 text-sm font-semibold text-black/80">
                    {project.description}
                  </p>
                </div>

                {/* Body/Skills Section */}
                <div className="p-5 flex-grow bg-white flex flex-col justify-between">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.requiredSkills.slice(0, 3).map((skill) => (
                      <span key={skill} className="text-xs font-bold uppercase tracking-wider border-2 border-black px-2 py-1 bg-cyan-100 text-black shadow-neo-sm rounded-md">
                        {skill}
                      </span>
                    ))}
                    {project.requiredSkills.length > 3 && (
                      <span className="text-xs font-bold uppercase tracking-wider border-2 border-black px-2 py-1 bg-gray-200 text-black shadow-neo-sm rounded-md">
                        +{project.requiredSkills.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-sm font-black uppercase border-2 border-black bg-amber-100 text-black w-fit px-3 py-1.5 shadow-neo-sm rounded-md mt-auto">
                    <Users className="w-4 h-4 mr-2" />
                    {project._count.applications} Ứng viên
                  </div>
                </div>

                {/* Brutalist Footer Action */}
                <Link href={`/sme/projects/${project.id}`} className="block w-full focus:outline-none">
                  <div className={`w-full h-14 flex items-center justify-center font-black uppercase text-base border-0 transition-colors bg-white ${cardBgColor.replace('bg-', 'hover:bg-')} text-black`}>
                    Xem chi tiết <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
