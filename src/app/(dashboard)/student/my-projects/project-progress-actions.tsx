"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/modules/shared/ui";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/modules/shared/ui";
import { Input } from "@/modules/shared/ui";
import { Label } from "@/modules/shared/ui";
import { Textarea } from "@/modules/shared/ui";
import { type FormActionResult } from "@/modules/shared";

type ProjectProgressActionsProps = {
  entryId: string;
  entryStatus: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED";
  addMilestoneAction: (formData: FormData) => Promise<FormActionResult>;
  addProgressUpdateAction: (formData: FormData) => Promise<FormActionResult>;
  submitDeliverableAction: (formData: FormData) => Promise<FormActionResult>;
};

type PendingAction = "milestone" | "update" | "deliverable" | null;

export function ProjectProgressActions({
  entryId,
  entryStatus,
  addMilestoneAction,
  addProgressUpdateAction,
  submitDeliverableAction,
}: ProjectProgressActionsProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [deliverableDialogOpen, setDeliverableDialogOpen] = useState(false);

  const isLocked = entryStatus === "SUBMITTED" || entryStatus === "COMPLETED";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    actionType: Exclude<PendingAction, null>,
    action: (formData: FormData) => Promise<FormActionResult>,
    onSuccess: () => void,
  ) {
    event.preventDefault();
    setPendingAction(actionType);
    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const result = await action(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      form.reset();
      onSuccess();
      router.refresh();

      if (actionType === "deliverable") {
        toast.success("Đã nộp sản phẩm, đang chờ SME nghiệm thu.");
      } else {
        toast.success("Đã cập nhật tiến độ.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật tiến độ lúc này. Vui lòng thử lại.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  if (isLocked) {
    return null;
  }

  return (
    <>
      <Dialog onOpenChange={setProgressDialogOpen} open={progressDialogOpen}>
      <DialogTrigger
        render={
            <Button className="h-10 w-full rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800" />
        }
      >
          <PlusCircle className="w-4 h-4 mr-2" />
          Cập nhật tiến độ
        </DialogTrigger>
        <DialogContent className="max-w-lg border-border/70">
          <DialogHeader>
            <DialogTitle>Cập nhật tiến độ dự án</DialogTitle>
            <DialogDescription>
              Thêm milestone hoặc ghi chú ngắn để SME theo dõi tiến độ.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <form
              className="space-y-3 rounded-xl border border-border/70 bg-slate-50 p-4"
              onSubmit={(event) =>
                handleSubmit(event, "milestone", addMilestoneAction, () =>
                  setProgressDialogOpen(false),
                )
              }
            >
              <input name="progressId" type="hidden" value={entryId} />
              <div className="space-y-2">
                <Label htmlFor={`milestone-${entryId}`}>Thêm milestone</Label>
                <Input
                  id={`milestone-${entryId}`}
                  name="title"
                  placeholder="Ví dụ: Hoàn tất giao diện dashboard"
                  required
                />
              </div>
              <Button
                className="h-10 w-full rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800"
                disabled={pendingAction !== null}
                type="submit"
              >
                {pendingAction === "milestone" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu milestone"
                )}
              </Button>
            </form>

            <form
              className="space-y-3 rounded-xl border border-border/70 bg-slate-50 p-4"
              onSubmit={(event) =>
                handleSubmit(event, "update", addProgressUpdateAction, () =>
                  setProgressDialogOpen(false),
                )
              }
            >
              <input name="progressId" type="hidden" value={entryId} />
              <div className="space-y-2">
                <Label htmlFor={`update-${entryId}`}>Cập nhật tiến độ</Label>
                <Textarea
                  id={`update-${entryId}`}
                  name="content"
                  placeholder="Mô tả ngắn bạn đã làm được gì hôm nay..."
                  required
                />
              </div>
              <Button
                className="h-10 w-full rounded-full border border-border bg-white text-slate-700 hover:bg-slate-100"
                disabled={pendingAction !== null}
                type="submit"
                variant="secondary"
              >
                {pendingAction === "update" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu cập nhật"
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={setDeliverableDialogOpen}
        open={deliverableDialogOpen}
      >
        <DialogTrigger render={<Button className="w-full" variant="outline" />}>
          <Send className="w-4 h-4 mr-2" />
          Nộp sản phẩm
        </DialogTrigger>
        <DialogContent className="max-w-lg border-border/70">
          <DialogHeader>
            <DialogTitle>Nộp sản phẩm bàn giao</DialogTitle>
            <DialogDescription>
              Gửi link sản phẩm hoàn chỉnh để SME xem và nghiệm thu.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) =>
              handleSubmit(event, "deliverable", submitDeliverableAction, () =>
                setDeliverableDialogOpen(false),
              )
            }
          >
            <input name="progressId" type="hidden" value={entryId} />
            <div className="space-y-2">
              <Label htmlFor={`deliverable-${entryId}`}>Link bàn giao</Label>
              <Input
                id={`deliverable-${entryId}`}
                name="deliverableUrl"
                placeholder="https://github.com/... hoặc https://vercel.app/..."
                required
                type="url"
              />
            </div>
            <Button
              className="h-10 w-full rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800"
              disabled={pendingAction !== null}
              type="submit"
            >
              {pendingAction === "deliverable" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang nộp...
                </>
              ) : (
                "Gửi bàn giao"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
