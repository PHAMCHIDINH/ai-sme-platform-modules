"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/modules/shared/ui";
import { type FormActionResult } from "@/modules/shared";

type AcceptDeliverableButtonProps = {
  action: () => Promise<FormActionResult>;
};

export function AcceptDeliverableButton({ action }: AcceptDeliverableButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAccept() {
    startTransition(async () => {
      try {
        const result = await action();
        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success("Đã chấp nhận bàn giao.");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể nghiệm thu bàn giao lúc này. Vui lòng thử lại.",
        );
      }
    });
  }

  return (
    <Button
      className="w-full bg-green-600 text-white hover:bg-green-700"
      disabled={isPending}
      onClick={handleAccept}
      type="button"
    >
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Chấp nhận bàn giao
    </Button>
  );
}
