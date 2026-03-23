"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Layers, Loader2, Building2, GraduationCap } from "lucide-react";
import { register as registerAction } from "@/modules/auth";
import { Button } from "@/modules/shared/ui";
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
    <div className="w-full max-w-md rounded-3xl border border-border/80 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 space-y-4">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
          <div className="rounded-full bg-white p-1.5">
            <Layers className="h-4 w-4 text-emerald-700" />
          </div>
          <span className="text-sm font-semibold text-slate-800">
            VnSME<span className="text-emerald-700">Match</span>
          </span>
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Tạo tài khoản mới</h1>
          <p className="text-sm leading-6 text-slate-600">Chọn vai trò để vào đúng luồng discovery và collaboration.</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <input type="hidden" {...register("role")} />

        <div className="mb-4 grid grid-cols-2 gap-3">
          <button
            className={`flex flex-col items-center justify-center rounded-xl border p-4 text-sm font-semibold transition-colors ${
              role === "STUDENT"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-border bg-white text-slate-700 hover:bg-slate-50"
            }`}
            onClick={() => setValue("role", "STUDENT", { shouldValidate: true })}
            type="button"
          >
            <GraduationCap className="mb-2 h-5 w-5" />
            <span>Sinh viên</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center rounded-xl border p-4 text-sm font-semibold transition-colors ${
              role === "SME"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-border bg-white text-slate-700 hover:bg-slate-50"
            }`}
            onClick={() => setValue("role", "SME", { shouldValidate: true })}
            type="button"
          >
            <Building2 className="mb-2 h-5 w-5" />
            <span>Doanh nghiệp</span>
          </button>
        </div>
        <FieldError message={errors.role?.message} />

        <div className="space-y-2">
          <Label htmlFor="name">Họ và tên</Label>
          <Input
            className="rounded-xl border border-border bg-white"
            id="name"
            placeholder={role === "STUDENT" ? "Nguyễn Văn A" : "Tên công ty / Người đại diện"}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            className="rounded-xl border border-border bg-white"
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
            className="rounded-xl border border-border bg-white"
            id="password"
            type="password"
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </div>

        {serverError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
            {serverError}
          </div>
        ) : null}

        <Button className="mt-4 h-11 w-full rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800" disabled={isSubmitting} type="submit">
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

      <p className="mt-5 text-center text-sm font-medium text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-emerald-700 underline-offset-4 hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
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
