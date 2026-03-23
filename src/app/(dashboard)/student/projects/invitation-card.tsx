"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Check, X, Loader2, Building2, Flame } from "lucide-react";
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
      toast.success(status === "ACCEPTED" ? "Đã NHẬN DỰ ÁN thành công!" : "Đã từ chối lời mời.");
      router.refresh();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    }
  });

  return (
    <div className="bg-yellow-300 border-4 border-black p-6 shadow-neo-lg relative overflow-hidden flex flex-col md:flex-row gap-6 items-center justify-between transform hover:-translate-y-1 transition-transform mb-8">
      <div className="absolute top-0 right-0 p-2 bg-red-500 border-l-4 border-b-4 border-black font-black text-white uppercase text-xs flex items-center animate-pulse">
        <Flame className="w-4 h-4 mr-1" /> Lời Mời Trực Tiếp
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <span className="font-bold border-2 border-black bg-white px-2 py-0.5 text-xs uppercase shadow-neo-sm flex items-center">
            <Building2 className="w-3 h-3 mr-1" /> {invitation.project.sme.companyName}
          </span>
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight">{invitation.project.title}</h3>
        <p className="font-semibold text-black/80 max-w-xl line-clamp-2">{invitation.project.expectedOutput}</p>
        <div className="flex gap-4 text-sm font-bold bg-white w-fit border-2 border-black px-3 py-1 shadow-neo-sm">
           <span>💰 {invitation.project.budget || "Thỏa thuận"}</span>
           <span className="text-gray-300">|</span>
           <span>⏱️ {invitation.project.duration}</span>
        </div>
      </div>

      <div className="flex w-full md:w-auto gap-3">
        <Button 
          onClick={() => respondMutation.mutate("REJECTED")}
          disabled={respondMutation.isPending}
          className="flex-1 md:flex-none border-4 border-black rounded-none shadow-neo-sm font-black uppercase bg-white hover:bg-gray-200 text-black h-14 w-14 p-0"
        >
          {respondMutation.isPending && respondMutation.variables === "REJECTED" ? <Loader2 className="animate-spin w-5 h-5" /> : <X className="w-6 h-6 text-red-500" />}
        </Button>
        <Button 
          onClick={() => respondMutation.mutate("ACCEPTED")}
          disabled={respondMutation.isPending}
          className="flex-1 md:flex-none border-4 border-black rounded-none shadow-neo-lg hover:shadow-neo-md active:translate-y-1 bg-lime-400 hover:bg-lime-500 text-black font-black uppercase text-lg px-8 h-14"
        >
          {respondMutation.isPending && respondMutation.variables === "ACCEPTED" ? <Loader2 className="animate-spin mr-2 w-5 h-5" /> : <Check className="w-6 h-6 mr-1" /> } 
           CHỚP THỜI CƠ
        </Button>
      </div>
    </div>
  );
}
