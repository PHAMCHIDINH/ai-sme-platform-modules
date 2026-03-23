"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Loader2, Send, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { Input } from "@/modules/shared/ui";
import { Button } from "@/modules/shared/ui";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/modules/shared/ui";
import { Badge } from "@/modules/shared/ui";
import { inviteStudent } from "@/modules/application";

// Dialog components if shadcn is used (Mocking simple modal if not imported)
// I will use a simple state-based modal for the invite selection to avoid missing dependencies.

type Student = {
  id: string;
  university: string;
  major: string;
  skills: string[];
  matchScore?: number;
  user: { name: string; email: string };
};

type ProjectLite = {
  id: string;
  title: string;
  status: "DRAFT" | "OPEN" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED";
};

export default function SmeStudentsPage() {
  const [search, setSearch] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["sme-students", search],
    queryFn: async () => {
      const url = search ? `/api/sme/students?q=${encodeURIComponent(search)}` : "/api/sme/students";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Không thể tải danh sách sinh viên.");
      return res.json();
    },
  });

  // Fetch SME's projects to populate the modal select
  const { data: myProjects } = useQuery<ProjectLite[]>({
    queryKey: ["sme-projects-lite"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) return [];
      const payload = (await res.json()) as { projects?: ProjectLite[] };
      const projects = Array.isArray(payload.projects) ? payload.projects : [];
      return projects.filter((project) => project.status === "OPEN");
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ projectId, studentId }: { projectId: string; studentId: string }) => {
      const res = await inviteStudent(projectId, studentId);
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      toast.success("Đã gửi lời mời thành công!");
      setInviteModalOpen(false);
      setSelectedStudent(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    }
  });

  const handleOpenInvite = (student: Student) => {
    setSelectedStudent(student);
    setInviteModalOpen(true);
  };

  const submitInvite = () => {
    if (!selectedProjectId || !selectedStudent) {
      toast.error("Vui lòng chọn dự án");
      return;
    }
    inviteMutation.mutate({ projectId: selectedProjectId, studentId: selectedStudent.id });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-fuchsia-300 border-2 border-black p-8 rounded-none shadow-neo-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">HEADHUNT AI</h1>
          <p className="font-bold text-black/80">Khám phá và chiêu mộ sinh viên tài năng nhất cho dự án của bạn.</p>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-20">
          <Search className="w-64 h-64" />
        </div>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 border-2 border-black shadow-neo-sm">
        <Search className="w-5 h-5 text-gray-500" />
        <Input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nhập mô tả dự án để AI gợi ý sinh viên phù hợp nhất..."
          className="shadow-none border-none text-lg focus-visible:ring-0 px-0 rounded-none bg-transparent"
        />
        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students?.map((student) => (
          <Card key={student.id} className="border-2 border-black rounded-none shadow-neo-md hover:shadow-neo-lg transition-all hover:-translate-y-1 bg-white flex flex-col">
            <CardHeader className="border-b-2 border-black bg-emerald-100 flex-row items-center justify-between space-y-0">
              <CardTitle className="font-black text-xl line-clamp-1">{student.user.name}</CardTitle>
              {student.matchScore !== undefined && student.matchScore > 0 && (
                <Badge className="bg-yellow-300 text-black border-2 border-black shadow-neo-sm rounded-none text-base font-bold flex gap-1">
                  <Star className="w-4 h-4 fill-black" /> {student.matchScore}%
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Trường / Chuyên ngành</p>
                <p className="font-semibold">{student.university}</p>
                <p className="text-sm">{student.major}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase mb-2">Kỹ năng</p>
                <div className="flex flex-wrap gap-2">
                  {student.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 border border-black text-xs font-bold font-mono">
                      {skill}
                    </span>
                  ))}
                  {student.skills.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 border border-black text-xs font-bold font-mono">
                      +{student.skills.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-0 border-t-2 border-black">
              <Button 
                onClick={() => handleOpenInvite(student)}
                className="w-full rounded-none h-12 bg-black hover:bg-black/90 text-white font-black uppercase tracking-widest text-base"
              >
                Mời Hợp Tác <Send className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        {students?.length === 0 && !isLoading && (
           <div className="col-span-full py-12 flex flex-col items-center justify-center bg-yellow-300 border-2 border-black shadow-neo-md">
             <Search className="w-12 h-12 mb-4" />
             <h3 className="text-2xl font-black uppercase">KHÔNG TÌM THẤY ỨNG VIÊN NÀO</h3>
             <p className="font-bold">Hãy thử nhập từ khóa khác.</p>
           </div>
        )}
      </div>

      {inviteModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6 animate-in zoom-in-95">
            <h2 className="text-2xl font-black uppercase mb-2">Chọn Dự Án</h2>
            <p className="mb-6 font-medium">Bạn muốn mời <span className="font-bold text-emerald-600">{selectedStudent.user.name}</span> tham gia dự án nào?</p>
            
            <div className="space-y-4 mb-6">
              <select 
                value={selectedProjectId} 
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 ring-emerald-400 bg-gray-50"
              >
                <option value="" disabled>-- Chọn dự án mở --</option>
                {myProjects?.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              {myProjects?.length === 0 && (
                <p className="text-red-500 text-sm font-bold">Bạn không có dự án nào đang MỞ để mời.</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setInviteModalOpen(false)}
                className="flex-1 rounded-none border-2 border-black shadow-neo-sm font-bold h-12"
              >
                HỦY
              </Button>
              <Button 
                onClick={submitInvite}
                disabled={!selectedProjectId || inviteMutation.isPending}
                className="flex-1 rounded-none bg-emerald-400 hover:bg-emerald-500 text-black border-2 border-black shadow-neo-sm font-black h-12"
              >
                {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "GỬI LỜI MỜI"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
