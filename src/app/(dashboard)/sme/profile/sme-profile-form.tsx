"use client";

import { type FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Save } from "lucide-react";
import { toast } from "react-hot-toast";
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
          <Button className="h-11 w-full rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800 sm:w-auto" disabled={isPending} type="submit">
            {isPending ? (
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
