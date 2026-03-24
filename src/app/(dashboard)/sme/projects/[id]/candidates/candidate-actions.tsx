"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { updateCandidateStatus } from "@/modules/application";
import { Button } from "@/modules/shared/ui";

type CandidateActionsProps = {
  projectId: string;
  studentId: string;
};

type ActionStatus = "ACCEPTED" | "REJECTED" | null;

export function CandidateActions({ projectId, studentId }: CandidateActionsProps) {
  const [loadingStatus, setLoadingStatus] = useState<ActionStatus>(null);

  async function handleAction(status: "ACCEPTED" | "REJECTED") {
    setLoadingStatus(status);
    try {
      const result = await updateCandidateStatus(projectId, studentId, status);

      if (!result.ok) {
        toast.error(result.error);
      } else if (status === "ACCEPTED") {
        toast.success("Đã chấp nhận ứng viên.");
      } else {
        toast.success("Đã từ chối ứng viên.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái ứng viên lúc này.",
      );
    } finally {
      setLoadingStatus(null);
    }
  }

  const isLoading = loadingStatus !== null;

  return (
    <>
      <Button
        className="h-10 flex-1 rounded-full border-0 bg-emerald-700 text-sm font-semibold text-white hover:bg-emerald-800"
        disabled={isLoading}
        onClick={() => handleAction("ACCEPTED")}
        size="sm"
        type="button"
      >
        {loadingStatus === "ACCEPTED" ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <Check className="w-4 h-4 mr-1" />
        )}
        Chấp nhận
      </Button>
      <Button
        className="h-10 flex-1 rounded-full border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700 hover:bg-rose-100"
        disabled={isLoading}
        onClick={() => handleAction("REJECTED")}
        size="sm"
        type="button"
        variant="secondary"
      >
        {loadingStatus === "REJECTED" ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <X className="w-4 h-4 mr-1" />
        )}
        Từ chối
      </Button>
    </>
  );
}
