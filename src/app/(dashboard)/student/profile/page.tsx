"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Save, GraduationCap, Code2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/ui";
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

  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "object" &&
    payload.error !== null &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  return fallback;
}

export default function StudentProfilePage() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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
      avatarUrl: "",
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
  const avatarUrl = watch("avatarUrl");

  const uploadAvatarToCloudinary = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ (jpg, png, webp...).");
      return;
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("Ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn.");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const signResponse = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "student-avatars" }),
      });
      const signPayload = (await signResponse.json()) as unknown;

      if (!signResponse.ok) {
        throw new Error(getErrorMessage(signPayload, "Không thể tạo chữ ký upload ảnh."));
      }

      if (
        typeof signPayload !== "object" ||
        signPayload === null ||
        !("cloudName" in signPayload) ||
        !("apiKey" in signPayload) ||
        !("folder" in signPayload) ||
        !("timestamp" in signPayload) ||
        !("signature" in signPayload) ||
        typeof signPayload.cloudName !== "string" ||
        typeof signPayload.apiKey !== "string" ||
        typeof signPayload.folder !== "string" ||
        typeof signPayload.timestamp !== "number" ||
        typeof signPayload.signature !== "string"
      ) {
        throw new Error("Phản hồi chữ ký Cloudinary không hợp lệ.");
      }

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("api_key", signPayload.apiKey);
      uploadFormData.append("timestamp", String(signPayload.timestamp));
      uploadFormData.append("signature", signPayload.signature);
      uploadFormData.append("folder", signPayload.folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signPayload.cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadFormData,
        },
      );
      const uploadPayload = (await uploadResponse.json()) as unknown;

      if (!uploadResponse.ok) {
        throw new Error(getErrorMessage(uploadPayload, "Upload ảnh lên Cloudinary thất bại."));
      }

      if (
        typeof uploadPayload !== "object" ||
        uploadPayload === null ||
        !("secure_url" in uploadPayload) ||
        typeof uploadPayload.secure_url !== "string"
      ) {
        throw new Error("Không nhận được URL ảnh từ Cloudinary.");
      }

      setValue("avatarUrl", uploadPayload.secure_url, {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success("Upload ảnh thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể upload ảnh lúc này.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-10">
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
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      <div className="portal-shell p-6 md:p-8">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Hồ sơ năng lực thực chiến</h2>
        <p className="mt-2 flex items-center text-sm text-slate-600">
          <Sparkles className="mr-1 h-4 w-4 text-emerald-700" />
          Hồ sơ này được dùng để AI phân tích mức phù hợp giữa kỹ năng của bạn và nhu cầu dự án.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="!rounded-2xl !border !border-border/70 !bg-white !shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5 text-emerald-700" /> Thông tin cơ bản
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

            <Card className="!rounded-2xl !border !border-border/70 !bg-white !shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code2 className="mr-2 h-5 w-5 text-sky-700" /> Kỹ năng và Công nghệ
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
            <Card className="!rounded-2xl !border !border-border/70 !bg-white !shadow-sm">
              <CardHeader>
                <CardTitle>Liên kết & Thời gian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="avatarFile">Tải ảnh đại diện từ máy (Cloudinary)</Label>
                  <Input
                    accept="image/*"
                    disabled={isUploadingAvatar}
                    id="avatarFile"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadAvatarToCloudinary(file);
                      }
                      event.target.value = "";
                    }}
                    type="file"
                  />
                  <p className="text-xs text-slate-500">
                    Hỗ trợ ảnh JPG/PNG/WEBP, tối đa 2MB. Ảnh sẽ upload lên Cloudinary và tự điền vào URL bên dưới.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Ảnh đại diện (URL)</Label>
                  <Input id="avatarUrl" placeholder="https://example.com/avatar.jpg" type="url" {...register("avatarUrl")} />
                  <FieldError message={errors.avatarUrl?.message} />
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Xem trước ảnh đại diện</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Avatar className="size-14">
                      <AvatarImage alt="Ảnh đại diện sinh viên" src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-emerald-100 text-sm font-semibold text-emerald-700">SV</AvatarFallback>
                    </Avatar>
                    <p className="text-xs leading-5 text-slate-600">
                      Ảnh sẽ được hiển thị khi doanh nghiệp xem hồ sơ ứng viên trong danh sách matching.
                    </p>
                  </div>
                </div>
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
                  className="h-11 w-full rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800"
                  disabled={updateProfileMutation.isPending || isUploadingAvatar}
                  type="submit"
                >
                  {updateProfileMutation.isPending || isUploadingAvatar ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  Lưu hồ sơ AI Profile
                </Button>
              </CardFooter>
            </Card>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h4 className="mb-2 font-semibold text-emerald-800">Gợi ý tối ưu matching</h4>
              <p className="text-sm leading-relaxed text-emerald-700/90">
                Hồ sơ càng chi tiết ở phần Kỹ năng và Công nghệ, AI sẽ càng gợi ý chính xác dự án có thể đáp ứng năng lực của bạn, tăng tỷ lệ matching x3.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
