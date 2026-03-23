"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowRight, Layers, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authenticate, getAuthActionErrorMessage } from "@/modules/auth";
import { Button } from "@/modules/shared/ui";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/modules/shared/ui";
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
    <div className="flex min-h-screen items-center justify-center p-4">
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
            <CardTitle className="text-2xl">Chào mừng trở lại</CardTitle>
            <CardDescription>Đăng nhập để tiếp tục với tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  autoComplete="email"
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
                  <span className="text-sm font-semibold text-muted-foreground">
                    Quên mật khẩu? (Sắp có)
                  </span>
                </div>
                <Input
                  autoComplete="current-password"
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
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 text-center text-sm font-medium text-muted-foreground">
            <div>
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-black underline-offset-4 hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
