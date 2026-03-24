"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Search, Send, Star, UserRoundSearch } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { inviteStudent } from "@/modules/application";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/ui";
import { Badge, Button, DiscoveryResultCard, FilterSidebar, Input } from "@/modules/shared/ui";

type Student = {
  id: string;
  university: string;
  major: string;
  skills: string[];
  avatarUrl?: string | null;
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
      toast.success("Đã gửi lời mời thành công.");
      setInviteModalOpen(false);
      setSelectedStudent(null);
      setSelectedProjectId("");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    },
  });

  const handleOpenInvite = (student: Student) => {
    setSelectedStudent(student);
    setInviteModalOpen(true);
  };

  const submitInvite = () => {
    if (!selectedProjectId || !selectedStudent) {
      toast.error("Vui lòng chọn dự án đang mở.");
      return;
    }
    inviteMutation.mutate({ projectId: selectedProjectId, studentId: selectedStudent.id });
  };

  return (
    <div className="space-y-8">
      <header className="portal-shell p-6 md:p-8">
        <div className="space-y-2">
          <p className="portal-kicker">SME candidate discovery</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Tìm sinh viên phù hợp cho dự án đang mở</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Duyệt danh sách theo năng lực và gửi lời mời trực tiếp tới các ứng viên phù hợp nhất với bài toán của bạn.
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <FilterSidebar
          description="Chỉ có dự án trạng thái OPEN mới khả dụng để gửi lời mời."
          title="Sourcing filters"
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Search query</p>
            <p className="text-sm leading-6 text-slate-500">
              Nhập từ khóa để lọc theo kỹ năng, chuyên ngành hoặc trường học.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Dự án khả dụng</p>
            <Badge className="rounded-full border border-border bg-slate-50 text-slate-700" variant="outline">
              {(myProjects?.length ?? 0)} dự án OPEN
            </Badge>
          </div>
        </FilterSidebar>

        <section className="space-y-4">
          <div className="portal-panel flex items-center gap-3 p-4">
            <Search className="h-4 w-4 text-slate-500" />
            <Input
              className="h-10 rounded-xl border border-border bg-white"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập kỹ năng, chuyên ngành hoặc tên trường..."
              value={search}
            />
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : null}
          </div>

          {students?.length === 0 && !isLoading ? (
            <div className="portal-panel flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center">
              <UserRoundSearch className="h-10 w-10 text-slate-400" />
              <p className="text-lg font-semibold text-slate-900">Không tìm thấy ứng viên phù hợp</p>
              <p className="max-w-md text-sm leading-6 text-slate-500">Thử điều chỉnh từ khóa hoặc đăng thêm dự án để mở rộng pipeline.</p>
            </div>
          ) : (
            <div className="portal-listing-grid">
              {students?.map((student) => (
                <DiscoveryResultCard
                  actions={
                    <Button
                      className="h-10 rounded-full border-0 bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800"
                      onClick={() => handleOpenInvite(student)}
                    >
                      <Send className="h-4 w-4" /> Mời hợp tác
                    </Button>
                  }
                  badges={
                    <>
                      {student.skills.slice(0, 4).map((skill) => (
                        <span className="rounded-full border border-border bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700" key={skill}>
                          {skill}
                        </span>
                      ))}
                      {student.skills.length > 4 ? (
                        <span className="rounded-full border border-border bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          +{student.skills.length - 4}
                        </span>
                      ) : null}
                    </>
                  }
                  eyebrow={student.user.email}
                  key={student.id}
                  leading={
                    <Avatar className="size-11">
                      <AvatarImage alt={`Ảnh đại diện của ${student.user.name}`} src={student.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-emerald-100 font-semibold text-emerald-700">
                        {student.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  }
                  metadata={
                    <>
                      <span>{student.university}</span>
                      <span>{student.major}</span>
                    </>
                  }
                  score={
                    student.matchScore && student.matchScore > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" /> {student.matchScore}%
                      </span>
                    ) : (
                      "No score"
                    )
                  }
                  summary="Ứng viên sẵn sàng tham gia dự án thực chiến qua lời mời trực tiếp từ doanh nghiệp."
                  title={student.user.name}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {inviteModalOpen && selectedStudent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-900">Gửi lời mời hợp tác</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Chọn dự án OPEN để mời <span className="font-semibold text-slate-900">{selectedStudent.user.name}</span> tham gia.
            </p>

            <div className="mt-5 space-y-3">
              <select
                className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-medium text-slate-800"
                onChange={(e) => setSelectedProjectId(e.target.value)}
                value={selectedProjectId}
              >
                <option value="" disabled>
                  -- Chọn dự án OPEN --
                </option>
                {myProjects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
              {myProjects?.length === 0 ? <p className="text-sm text-rose-600">Bạn chưa có dự án nào ở trạng thái OPEN.</p> : null}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                className="h-10 flex-1 rounded-full border border-border bg-white text-slate-700 hover:bg-slate-50"
                onClick={() => setInviteModalOpen(false)}
                variant="outline"
              >
                Hủy
              </Button>
              <Button
                className="h-10 flex-1 rounded-full border-0 bg-emerald-700 text-sm font-semibold text-white hover:bg-emerald-800"
                disabled={!selectedProjectId || inviteMutation.isPending}
                onClick={submitInvite}
              >
                {inviteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gửi lời mời"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
