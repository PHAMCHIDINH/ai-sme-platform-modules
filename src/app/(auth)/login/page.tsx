"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowRight, Layers, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authenticate, getAuthActionErrorMessage } from "@/modules/auth";
import { Button } from "@/modules/shared/ui";
import { Input } from "@/modules/shared/ui";
import { Label } from "@/modules/shared/ui";
import { loginSchema, type LoginInput } from "@/modules/auth";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm font-semibold text-destructive">{message}</p>;
}

export default function LoginPage() {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");

    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);

    const result = await authenticate(undefined, formData);
    const authError = getAuthActionErrorMessage(result);
    if (authError) {
      setServerError(authError);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
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
            <h1 className="text-3xl font-semibold text-slate-900">Đăng nhập workspace</h1>
            <p className="text-sm leading-6 text-slate-600">Tiếp tục flow discovery và quản lý dự án của bạn.</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              className="rounded-xl border border-border bg-white"
              id="email"
              placeholder="name@example.com"
              type="email"
              {...register("email")}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <span className="text-sm font-medium text-muted-foreground">
                Quên mật khẩu? (Sắp có)
              </span>
            </div>
            <Input
              autoComplete="current-password"
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
                Đang đăng nhập...
              </>
            ) : (
              <>
                Đăng nhập <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm font-medium text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-emerald-700 underline-offset-4 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
