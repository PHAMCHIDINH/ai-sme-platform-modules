"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Check, X, Loader2, Building2, Sparkles } from "lucide-react";
import { respondToInvitation } from "@/modules/application";
import { Button } from "@/modules/shared/ui";

type Invitation = {
  projectId: string;
  project: {
    title: string;
    expectedOutput: string;
    budget: string | null;
    duration: string;
    sme: {
      companyName: string;
      avatarUrl?: string | null;
    };
  };
};

export function InvitationCard({ invitation }: { invitation: Invitation }) {
  const router = useRouter();
  const respondMutation = useMutation({
    mutationFn: async (status: "ACCEPTED" | "REJECTED") => {
      const res = await respondToInvitation(invitation.projectId, status);
      if (!res.ok) throw new Error(res.error);
      return res;
    },
    onSuccess: (_, status) => {
      toast.success(status === "ACCEPTED" ? "Đã chấp nhận lời mời." : "Đã từ chối lời mời.");
      router.refresh();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    }
  });

  return (
    <div className="mb-5 flex flex-col justify-between gap-6 rounded-2xl border border-violet-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
      <div className="flex-1 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
          <Sparkles className="h-3.5 w-3.5" /> SME đã mời bạn
        </div>
        <div className="flex items-center gap-2">
          {invitation.project.sme.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`Avatar của ${invitation.project.sme.companyName}`}
              className="h-8 w-8 rounded-full border border-emerald-200 object-cover"
              src={invitation.project.sme.avatarUrl}
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700">
              {invitation.project.sme.companyName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-slate-600">
            <Building2 className="h-3.5 w-3.5" /> {invitation.project.sme.companyName}
          </span>
        </div>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{invitation.project.title}</h3>
        <p className="max-w-xl line-clamp-2 text-sm leading-6 text-slate-600">{invitation.project.expectedOutput}</p>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
          <span className="rounded-full border border-border bg-slate-50 px-3 py-1">
            Ngân sách: {invitation.project.budget || "Thỏa thuận"}
          </span>
          <span className="rounded-full border border-border bg-slate-50 px-3 py-1">Thời lượng: {invitation.project.duration}</span>
        </div>
      </div>

      <div className="flex w-full gap-2 md:w-auto">
        <Button 
          onClick={() => respondMutation.mutate("REJECTED")}
          disabled={respondMutation.isPending}
          className="h-10 flex-1 rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 md:w-12 md:flex-none md:p-0"
        >
          {respondMutation.isPending && respondMutation.variables === "REJECTED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
        </Button>
        <Button 
          onClick={() => respondMutation.mutate("ACCEPTED")}
          disabled={respondMutation.isPending}
          className="h-10 flex-1 rounded-full border-0 bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          {respondMutation.isPending && respondMutation.variables === "ACCEPTED" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" /> }
          Chấp nhận
        </Button>
      </div>
    </div>
  );
}
