"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/modules/shared/ui";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/modules/shared/ui";
import { Textarea } from "@/modules/shared/ui";
import { type FormActionResult } from "@/modules/shared";

type Ratings = {
  outputQuality: number;
  onTime: number;
  proactiveness: number;
  communication: number;
  overallFit: number;
};

type SmeEvaluationDialogProps = {
  companyName: string;
  submitAction: (formData: FormData) => Promise<FormActionResult>;
};

const initialRatings: Ratings = {
  outputQuality: 0,
  onTime: 0,
  proactiveness: 0,
  communication: 0,
  overallFit: 0,
};

const criteria: Array<{ key: keyof Ratings; label: string }> = [
  { key: "outputQuality", label: "Mức độ rõ ràng của yêu cầu" },
  { key: "onTime", label: "Hỗ trợ & phản hồi" },
  { key: "proactiveness", label: "Tính thực tế của dự án" },
  { key: "communication", label: "Tinh thần hợp tác" },
  { key: "overallFit", label: "Đánh giá tổng thể" },
];

export function SmeEvaluationDialog({
  companyName,
  submitAction,
}: SmeEvaluationDialogProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [ratings, setRatings] = useState<Ratings>(initialRatings);
  const [isPending, startTransition] = useTransition();

  function handleRating(field: keyof Ratings, value: number) {
    setRatings((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const result = await submitAction(formData);
        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success("Đã gửi đánh giá doanh nghiệp.");
        setDialogOpen(false);
        setComment("");
        setRatings(initialRatings);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể gửi đánh giá lúc này. Vui lòng thử lại.",
        );
      }
    });
  }

  const hasEmptyRating = Object.values(ratings).some((value) => value === 0);

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger render={<Button className="w-full" variant="outline" />}>
        Đánh giá doanh nghiệp
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Đánh giá doanh nghiệp</DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm làm việc với {companyName} sau khi dự án hoàn thành.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input name="outputQuality" type="hidden" value={ratings.outputQuality} />
          <input name="onTime" type="hidden" value={ratings.onTime} />
          <input name="proactiveness" type="hidden" value={ratings.proactiveness} />
          <input name="communication" type="hidden" value={ratings.communication} />
          <input name="overallFit" type="hidden" value={ratings.overallFit} />

          {criteria.map((item) => (
            <div
              className="flex flex-col justify-between gap-2 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-center"
              key={item.key}
            >
              <span className="text-sm font-medium">{item.label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    aria-label={`${item.label}: ${value} sao`}
                    className="inline-flex"
                    key={value}
                    onClick={() => handleRating(item.key, value)}
                    type="button"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        value <= ratings[item.key]
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30 hover:text-amber-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-sm font-medium">Nhận xét chi tiết (Tùy chọn)</label>
            <Textarea
              className="min-h-[100px]"
              name="comment"
              onChange={(event) => setComment(event.target.value)}
              placeholder="Điều gì làm bạn hài lòng hoặc cần cải thiện khi làm việc với doanh nghiệp?"
              value={comment}
            />
          </div>

          <Button className="w-full" disabled={isPending || hasEmptyRating} type="submit">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi đánh giá"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
