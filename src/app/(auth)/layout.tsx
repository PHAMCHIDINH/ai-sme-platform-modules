import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (session) {
    redirect(session.user.role === "SME" ? "/sme/dashboard" : "/student/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-yellow-100">
      <div className="pointer-events-none absolute inset-0 bg-neo-grid bg-grid opacity-40" />
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-violet-200 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-cyan-200 blur-3xl" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
