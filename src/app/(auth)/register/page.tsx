"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Layers, Loader2, Building2, GraduationCap } from "lucide-react";
import { register as registerAction } from "@/modules/auth";
import { Button } from "@/modules/shared/ui";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/modules/shared/ui";
import { Input } from "@/modules/shared/ui";
import { Label } from "@/modules/shared/ui";
import { registerSchema, type RegisterInput } from "@/modules/auth";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm font-semibold text-destructive">{message}</p>;
}

function RegisterForm() {
  const [serverError, setServerError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
    },
  });

  const role = watch("role");

  useEffect(() => {
    const presetRole = searchParams.get("role");
    if (presetRole === "sme") {
      setValue("role", "SME");
    }
    if (presetRole === "student") {
      setValue("role", "STUDENT");
    }
  }, [searchParams, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");

    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("role", values.role);

    const result = await registerAction(undefined, formData);
    if (result.ok) {
      router.push("/login?registered=true");
      return;
    }

    setServerError(result.error || "Lỗi không xác định");
  });

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex justify-center">
        <Link href="/" className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-white px-4 py-2 shadow-neo-sm">
          <div className="rounded-md border-2 border-black bg-violet-200 p-1">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-xl font-black">
            VnSME<span className="text-violet-700">Match</span>
          </span>
        </Link>
      </div>

      <Card className="bg-white">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Tham gia nền tảng</CardTitle>
          <CardDescription>Đăng ký để bắt đầu kết nối dự án thực chiến</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <input type="hidden" {...register("role")} />

            <div className="mb-4 grid grid-cols-2 gap-4">
              <button
                className={`flex flex-col items-center justify-center rounded-md border-2 border-black p-4 font-bold transition-colors ${
                  role === "STUDENT"
                    ? "bg-violet-200"
                    : "bg-white hover:bg-yellow-200"
                }`}
                onClick={() => setValue("role", "STUDENT", { shouldValidate: true })}
                type="button"
              >
                <GraduationCap className="mb-2 h-6 w-6" />
                <span>Sinh viên</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center rounded-md border-2 border-black p-4 font-bold transition-colors ${
                  role === "SME"
                    ? "bg-cyan-200"
                    : "bg-white hover:bg-yellow-200"
                }`}
                onClick={() => setValue("role", "SME", { shouldValidate: true })}
                type="button"
              >
                <Building2 className="mb-2 h-6 w-6" />
                <span>Doanh nghiệp</span>
              </button>
            </div>
            <FieldError message={errors.role?.message} />

            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                placeholder={role === "STUDENT" ? "Nguyễn Văn A" : "Tên công ty / Người đại diện"}
                {...register("name")}
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                autoComplete="new-password"
                id="password"
                type="password"
                {...register("password")}
              />
              <FieldError message={errors.password?.message} />
            </div>

            {serverError ? (
              <div className="rounded-md border-2 border-black bg-red-200 p-3 text-sm font-semibold">
                {serverError}
              </div>
            ) : null}

            <Button className="mt-4 w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                <>
                  Tạo tài khoản <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 text-center text-sm font-medium text-muted-foreground">
          <div>
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-black underline-offset-4 hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="animate-spin text-foreground">
            <Loader2 className="h-8 w-8" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
