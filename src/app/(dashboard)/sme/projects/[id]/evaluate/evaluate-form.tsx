"use client";

import { type FormEvent, useState, useTransition } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/modules/shared/ui";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/modules/shared/ui";
import { Textarea } from "@/modules/shared/ui";
import { type FormActionResult } from "@/modules/shared";

type Ratings = {
  outputQuality: number;
  onTime: number;
  proactiveness: number;
  communication: number;
  overallFit: number;
};

type EvaluateFormProps = {
  studentName: string;
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
  { key: "outputQuality", label: "Chất lượng sản phẩm đầu ra" },
  { key: "onTime", label: "Đúng tiến độ / Deadline" },
  { key: "proactiveness", label: "Mức độ chủ động trong công việc" },
  { key: "communication", label: "Kỹ năng giao tiếp & Phản hồi" },
  { key: "overallFit", label: "Mức độ phù hợp với yêu cầu thực tế" },
];

export function EvaluateForm({ studentName, submitAction }: EvaluateFormProps) {
  const [ratings, setRatings] = useState<Ratings>(initialRatings);
  const [comment, setComment] = useState("");
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
        if (result?.error) {
          toast.error(result.error);
        }
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
    <form onSubmit={handleSubmit}>
      <Card className="portal-panel border-border/70 shadow-none">
        <CardHeader>
          <CardTitle>Tiêu chí đánh giá</CardTitle>
          <CardDescription>
            Chọn từ 1 đến 5 sao cho mỗi hạng mục để đánh giá {studentName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <input name="outputQuality" type="hidden" value={ratings.outputQuality} />
          <input name="onTime" type="hidden" value={ratings.onTime} />
          <input name="proactiveness" type="hidden" value={ratings.proactiveness} />
          <input name="communication" type="hidden" value={ratings.communication} />
          <input name="overallFit" type="hidden" value={ratings.overallFit} />

          {criteria.map((item) => (
            <div
              className="flex flex-col justify-between gap-2 rounded-xl border border-border/70 bg-slate-50 p-3 transition-colors hover:bg-slate-100 sm:flex-row sm:items-center"
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
                          : "text-slate-300 hover:text-amber-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-3 border-t border-border/70 pt-4">
            <label className="block text-sm font-medium">
              Nhận xét chi tiết (Tùy chọn)
            </label>
            <Textarea
              className="min-h-[100px]"
              name="comment"
              onChange={(event) => setComment(event.target.value)}
              placeholder="Bạn có đánh giá gì thêm về thái độ làm việc, kỹ năng của sinh viên không?"
              value={comment}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="h-11 w-full rounded-full border-0 bg-emerald-700 font-semibold text-white hover:bg-emerald-800"
            disabled={isPending || hasEmptyRating}
            type="submit"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Gửi đánh giá
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
