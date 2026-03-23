"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Save, GraduationCap, Code2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button } from "@/modules/shared/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/modules/shared/ui";
import { Input } from "@/modules/shared/ui";
import { Label } from "@/modules/shared/ui";
import { Skeleton } from "@/modules/shared/ui";
import { Textarea } from "@/modules/shared/ui";
import {
  studentProfileSchema,
  type StudentProfileInput,
} from "@/modules/matching";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return fallback;
}

export default function StudentProfilePage() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentProfileInput>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      university: "",
      major: "",
      description: "",
      skills: "",
      technologies: "",
      interests: "",
      githubUrl: "",
      portfolioUrl: "",
      availability: "",
    },
  });

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/student-profile", { method: "GET" });
        const payload = (await response.json()) as unknown;

        if (!response.ok) {
          throw new Error(getErrorMessage(payload, "Không thể tải hồ sơ hiện tại."));
        }

        if (
          typeof payload === "object" &&
          payload !== null &&
          "profile" in payload &&
          typeof payload.profile === "object" &&
          payload.profile !== null
        ) {
          reset(payload.profile as StudentProfileInput);
        }
      } catch (error) {
        if (active) {
          toast.error(error instanceof Error ? error.message : "Không thể tải hồ sơ hiện tại.");
        }
      } finally {
        if (active) {
          setIsInitialLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (values: StudentProfileInput) => {
      const response = await fetch("/api/student-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as unknown;

      if (!response.ok) {
        throw new Error(getErrorMessage(payload, "Lỗi cập nhật hồ sơ."));
      }

      return payload;
    },
    onSuccess: () => {
      toast.success("Cập nhật hồ sơ thành công.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Lỗi cập nhật hồ sơ.");
    },
  });

  const onSubmit = handleSubmit((values) => {
    updateProfileMutation.mutate(values);
  });

  if (isInitialLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Hồ sơ năng lực thực chiến</h2>
        <p className="text-muted-foreground text-sm flex items-center mt-1">
          <Sparkles className="w-4 h-4 mr-1 text-indigo-500" />
          Hồ sơ này sẽ được AI phân tích để ghép với các bài toán số hóa phù hợp từ doanh nghiệp
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-primary" /> Thông tin cơ bản
                </CardTitle>
                <CardDescription>Các thông tin trường đào tạo và định hướng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="university">Trường học / Cơ sở đào tạo</Label>
                    <Input id="university" {...register("university")} />
                    <FieldError message={errors.university?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">Chuyên ngành</Label>
                    <Input id="major" {...register("major")} />
                    <FieldError message={errors.major?.message} />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="description">Giới thiệu bản thân (Mục tiêu nghề nghiệp)</Label>
                  <Textarea
                    className="min-h-[100px]"
                    id="description"
                    placeholder="Hãy kể ngắn gọn điểm mạnh và định hướng học hỏi của bạn để Doanh nghiệp và AI hiểu bạn hơn."
                    {...register("description")}
                  />
                  <FieldError message={errors.description?.message} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white/50 backdrop-blur border-t-4 border-t-indigo-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code2 className="w-5 h-5 mr-2 text-indigo-500" /> Kỹ năng và Công nghệ
                </CardTitle>
                <CardDescription>Quan trọng! Dữ liệu này giúp AI ghép dự án chính xác</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Kỹ năng chuyên môn (cách nhau dấu phẩy)</Label>
                  <Input id="skills" {...register("skills")} />
                  <FieldError message={errors.skills?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="technologies">Công nghệ / Công cụ (cách nhau dấu phẩy)</Label>
                  <Input id="technologies" {...register("technologies")} />
                  <FieldError message={errors.technologies?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interests">Lĩnh vực mong muốn trải nghiệm</Label>
                  <Input id="interests" {...register("interests")} />
                  <FieldError message={errors.interests?.message} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Liên kết & Thời gian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input id="githubUrl" type="url" {...register("githubUrl")} />
                  <FieldError message={errors.githubUrl?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio / LinkedIn URL</Label>
                  <Input id="portfolioUrl" type="url" {...register("portfolioUrl")} />
                  <FieldError message={errors.portfolioUrl?.message} />
                </div>
                <div className="space-y-2 pt-4">
                  <Label htmlFor="availability">Khả năng đáp ứng thời gian</Label>
                  <Input id="availability" {...register("availability")} />
                  <FieldError message={errors.availability?.message} />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full shadow-lg h-12 rounded-xl"
                  disabled={updateProfileMutation.isPending}
                  type="submit"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  Lưu hồ sơ AI Profile
                </Button>
              </CardFooter>
            </Card>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
              <h4 className="font-semibold text-indigo-800 mb-2">💡 Tips nhỏ</h4>
              <p className="text-sm text-indigo-700/80 leading-relaxed">
                Hồ sơ càng chi tiết ở phần Kỹ năng và Công nghệ, AI sẽ càng gợi ý chính xác dự án có thể đáp ứng năng lực của bạn, tăng tỷ lệ matching x3.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
