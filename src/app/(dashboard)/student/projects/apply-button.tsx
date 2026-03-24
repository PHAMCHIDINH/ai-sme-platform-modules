"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { applyProject } from "@/modules/application";
import { Button } from "@/modules/shared/ui";

type ApplyButtonProps = {
  projectId: string;
  matchScore: number;
  disabledReason?: string;
  ctaLabel?: string;
};

export function ApplyButton({
  projectId,
  matchScore,
  disabledReason,
  ctaLabel,
  className,
}: ApplyButtonProps & { className?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleApply() {
    if (disabledReason) {
      toast.error(disabledReason);
      return;
    }

    setIsLoading(true);
    try {
      const result = await applyProject(projectId, matchScore);

      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Ứng tuyển thành công.");
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể ứng tuyển lúc này. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      className={
        className ||
        "h-10 rounded-full border-0 bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800"
      }
      disabled={isLoading || Boolean(disabledReason)}
      onClick={handleApply}
      type="button"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Đang gửi...
        </>
      ) : (
        ctaLabel ?? (disabledReason ? "Cập nhật hồ sơ để ứng tuyển" : "Ứng tuyển ngay")
      )}
    </Button>
  );
}
