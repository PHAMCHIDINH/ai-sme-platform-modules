"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2, MailPlus } from "lucide-react";
import { inviteStudent } from "@/modules/application";
import { Button } from "@/modules/shared/ui";

export function InviteAction({ projectId, studentId }: { projectId: string; studentId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleInvite() {
    setIsLoading(true);
    try {
      const res = await inviteStudent(projectId, studentId);
      if (!res.ok) toast.error(res.error);
      else toast.success("Đã gửi lời mời hợp tác thành công!");
    } catch {
      toast.error("Lỗi khi gửi lời mời.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      size="sm" 
      onClick={handleInvite} 
      disabled={isLoading} 
      variant="outline" 
      className="h-10 w-full rounded-full border border-violet-200 bg-violet-50 text-sm font-semibold text-violet-700 hover:bg-violet-100"
    >
      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MailPlus className="w-4 h-4 mr-2" />}
      Mời tham gia dự án
    </Button>
  );
}
