"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/ui";
import { Button } from "@/modules/shared/ui";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/modules/shared/ui";
import { Input } from "@/modules/shared/ui";
import { Label } from "@/modules/shared/ui";
import { Textarea } from "@/modules/shared/ui";
import { type FormActionResult } from "@/modules/shared";
import { type SmeProfileInput } from "@/modules/project";

type SmeProfileFormProps = {
  initialValues: SmeProfileInput;
  submitAction: (formData: FormData) => Promise<FormActionResult>;
};

export function SmeProfileForm({ initialValues, submitAction }: SmeProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialValues.avatarUrl);

  async function uploadAvatarToCloudinary(file: File) {
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
        body: JSON.stringify({ folder: "sme-avatars" }),
      });
      const signPayload = (await signResponse.json()) as unknown;

      if (!signResponse.ok) {
        throw new Error(
          typeof signPayload === "object" &&
            signPayload !== null &&
            "error" in signPayload &&
            typeof signPayload.error === "string"
            ? signPayload.error
            : "Không thể tạo chữ ký upload ảnh.",
        );
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
        throw new Error(
          typeof uploadPayload === "object" &&
            uploadPayload !== null &&
            "error" in uploadPayload &&
            typeof uploadPayload.error === "object" &&
            uploadPayload.error !== null &&
            "message" in uploadPayload.error &&
            typeof uploadPayload.error.message === "string"
            ? uploadPayload.error.message
            : "Upload ảnh lên Cloudinary thất bại.",
        );
      }

      if (
        typeof uploadPayload !== "object" ||
        uploadPayload === null ||
        !("secure_url" in uploadPayload) ||
        typeof uploadPayload.secure_url !== "string"
      ) {
        throw new Error("Không nhận được URL ảnh từ Cloudinary.");
      }

      setAvatarUrl(uploadPayload.secure_url);
      toast.success("Upload ảnh doanh nghiệp thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể upload ảnh lúc này.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const result = await submitAction(formData);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success("Đã cập nhật hồ sơ doanh nghiệp.");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể cập nhật hồ sơ doanh nghiệp lúc này.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="!rounded-2xl !border !border-border/70 !bg-white !shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5 text-emerald-700" />
            Thông tin doanh nghiệp
          </CardTitle>
          <CardDescription>
            Hồ sơ này giúp sinh viên hiểu rõ hơn về công ty trước khi ứng tuyển.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="avatarFile">Tải logo/ảnh đại diện doanh nghiệp (Cloudinary)</Label>
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
              Hỗ trợ JPG/PNG/WEBP, tối đa 2MB.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">URL ảnh đại diện doanh nghiệp</Label>
            <Input
              id="avatarUrl"
              name="avatarUrl"
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://example.com/logo.png"
              type="url"
              value={avatarUrl}
            />
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Xem trước avatar SME</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar className="size-14">
                <AvatarImage alt="Avatar doanh nghiệp" src={avatarUrl || undefined} />
                <AvatarFallback className="bg-emerald-100 text-sm font-semibold text-emerald-700">
                  {initialValues.companyName.charAt(0).toUpperCase() || "SME"}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs leading-5 text-slate-600">
                Avatar sẽ hiển thị ở khu giới thiệu doanh nghiệp và các danh sách dự án/mời ứng viên.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Tên công ty</Label>
            <Input
              defaultValue={initialValues.companyName}
              id="companyName"
              name="companyName"
              placeholder="VD: Công ty TNHH ABC Tech"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="industry">Ngành nghề</Label>
              <Input
                defaultValue={initialValues.industry}
                id="industry"
                name="industry"
                placeholder="VD: Thương mại điện tử"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companySize">Quy mô công ty</Label>
              <Input
                defaultValue={initialValues.companySize}
                id="companySize"
                name="companySize"
                placeholder="VD: 11-50 nhân sự"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả doanh nghiệp</Label>
            <Textarea
              className="min-h-[140px]"
              defaultValue={initialValues.description}
              id="description"
              name="description"
              placeholder="Giới thiệu ngắn về sản phẩm, khách hàng mục tiêu và định hướng chuyển đổi số."
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="h-11 w-full rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800 sm:w-auto" disabled={isPending || isUploadingAvatar} type="submit">
            {isPending || isUploadingAvatar ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu hồ sơ doanh nghiệp
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
