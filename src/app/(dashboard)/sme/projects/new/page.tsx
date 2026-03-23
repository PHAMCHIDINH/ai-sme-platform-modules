"use client";

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Sparkles, Loader2, Send, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/modules/shared/ui";
import { Input } from "@/modules/shared/ui";
import { Label } from "@/modules/shared/ui";
import { Textarea } from "@/modules/shared/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/ui";
import { buildProjectFormPrefillPatch } from "@/modules/ai";
import { projectFormSchema, type ProjectFormInput } from "@/modules/project";
import { cn } from "@/modules/shared";
import { clearChatDraft, loadChatDraft, saveChatDraft, type ChatDraft } from "./chat-draft-storage";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }
  return fallback;
}

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
};

type DraftCoverage = NonNullable<ChatDraft["coverage"]>;

type StoredChatDraft = ChatDraft & {
  isReadyToSubmit?: boolean;
};

const MAX_OUTBOUND_CHAT_TURNS = 16;

const INITIAL_FORM_VALUES: ProjectFormInput = {
  title: "",
  description: "",
  standardizedBrief: "",
  expectedOutput: "",
  requiredSkills: "",
  difficulty: "MEDIUM",
  duration: "",
  budget: "",
};

const COVERAGE_KEYS = [
  "businessContext",
  "deliverableScope",
  "requiredSkills",
  "timelineBudget",
] as const satisfies ReadonlyArray<keyof DraftCoverage>;

const INITIAL_MESSAGES: Message[] = [
  {
    id: "init",
    role: "assistant",
    content: "Chào bạn! Mình là trợ lý AI VnSMEMatch. Bạn đang muốn tìm sinh viên giải quyết bài toán gì cho doanh nghiệp hôm nay?",
    suggestions: [
      "Xây dựng Web bán hàng",
      "Viết content Fanpage",
      "Làm App quản lý nội bộ",
      "Phân tích dữ liệu KH"
    ],
  }
];

function isCoverageReport(value: unknown): value is DraftCoverage {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;

  return COVERAGE_KEYS.every((key) => {
    const state = candidate[key];
    return state === "missing" || state === "partial" || state === "complete";
  });
}

function isCoverageComplete(coverage: ChatDraft["coverage"]) {
  if (!coverage) return false;
  return COVERAGE_KEYS.every((key) => coverage[key] === "complete");
}

function readStoredReadyFlag(draft: ChatDraft) {
  const ready = (draft as StoredChatDraft).isReadyToSubmit;
  if (typeof ready === "boolean") {
    return ready;
  }

  return isCoverageComplete(draft.coverage);
}

function deriveChatProgressState(coverage: ChatDraft["coverage"], isReadyToSubmit?: boolean | null) {
  const completedGroups = coverage ? COVERAGE_KEYS.filter((key) => coverage[key] === "complete").length : 0;
  const percentage = Math.round((completedGroups / COVERAGE_KEYS.length) * 100);
  const ready = isReadyToSubmit === true;

  return {
    completedGroups,
    percentage,
    progressLabel: `${completedGroups}/${COVERAGE_KEYS.length} nhóm đã đủ`,
    isReadyToSubmit: ready,
    statusLabel: ready ? "Đủ điều kiện để đăng" : completedGroups > 0 ? "Đang hoàn thiện brief" : "Bắt đầu làm rõ yêu cầu",
  };
}

function extractSessionUserId(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return null;

  const candidate = payload as { user?: { id?: unknown } };
  return typeof candidate.user?.id === "string" && candidate.user.id.length > 0 ? candidate.user.id : null;
}

function boundOutboundHistory(messages: Message[]) {
  return messages.slice(-MAX_OUTBOUND_CHAT_TURNS);
}

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [coverage, setCoverage] = useState<ChatDraft["coverage"]>(null);
  const [chatReadyToSubmit, setChatReadyToSubmit] = useState(false);
  const [draftUserId, setDraftUserId] = useState<string | null>(null);
  const [hasResolvedDraftUserId, setHasResolvedDraftUserId] = useState(false);
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasUserInteractedRef = useRef(false);
  const pendingDraftClearRef = useRef(false);
  const hydratedDraftUserIdRef = useRef<string | null>(null);

  const {
    control,
    register,
    setValue,
    getValues,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<ProjectFormInput>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: INITIAL_FORM_VALUES,
  });
  const watchedFormValues = useWatch({ control }) as ProjectFormInput;
  const serializedFormValues = JSON.stringify(watchedFormValues);
  const messagesRef = useRef(messages);
  const coverageRef = useRef(coverage);
  const readyToSubmitRef = useRef(chatReadyToSubmit);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    coverageRef.current = coverage;
  }, [coverage]);

  useEffect(() => {
    readyToSubmitRef.current = chatReadyToSubmit;
  }, [chatReadyToSubmit]);

  useEffect(() => {
    if (isDirty) {
      hasUserInteractedRef.current = true;
    }
  }, [isDirty]);

  useEffect(() => {
    let isCancelled = false;

    async function resolveDraftUserId() {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
        });
        const sessionPayload = response.ok ? await response.json() : null;
        if (!isCancelled) {
          setDraftUserId(extractSessionUserId(sessionPayload));
        }
      } catch {
        if (!isCancelled) {
          setDraftUserId(null);
        }
      } finally {
        if (!isCancelled) {
          setHasResolvedDraftUserId(true);
        }
      }
    }

    resolveDraftUserId();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasResolvedDraftUserId) return;
    setHasHydratedDraft(false);

    if (!draftUserId) {
      hydratedDraftUserIdRef.current = null;
      setHasHydratedDraft(true);
      return;
    }

    const previousDraftUserId = hydratedDraftUserIdRef.current;
    hydratedDraftUserIdRef.current = draftUserId;

    if (previousDraftUserId && previousDraftUserId !== draftUserId) {
      setMessages(INITIAL_MESSAGES);
      setCoverage(null);
      setChatReadyToSubmit(false);
      reset(INITIAL_FORM_VALUES);
    }

    if (pendingDraftClearRef.current) {
      clearChatDraft(draftUserId);
      pendingDraftClearRef.current = false;
      setHasHydratedDraft(true);
      return;
    }

    const draft = loadChatDraft(draftUserId);
    if (hasUserInteractedRef.current) {
      setHasHydratedDraft(true);
      return;
    }

    if (draft) {
      setMessages(draft.messages.length > 0 ? draft.messages : INITIAL_MESSAGES);
      setCoverage(draft.coverage);
      setChatReadyToSubmit(readStoredReadyFlag(draft));
      reset(draft.parsedData ?? INITIAL_FORM_VALUES);
    }

    setHasHydratedDraft(true);
  }, [draftUserId, hasResolvedDraftUserId, reset]);

  const persistDraftSnapshot = ({
    nextMessages,
    nextParsedData = getValues(),
    nextCoverage = coverage,
    nextReadyToSubmit = chatReadyToSubmit,
  }: {
    nextMessages: Message[];
    nextParsedData?: ProjectFormInput;
    nextCoverage?: ChatDraft["coverage"];
    nextReadyToSubmit?: boolean;
  }) => {
    if (!draftUserId) return;

    const draft: StoredChatDraft = {
      schemaVersion: 1,
      messages: nextMessages,
      parsedData: {
        ...nextParsedData,
        budget: nextParsedData.budget ?? "",
        standardizedBrief: nextParsedData.standardizedBrief ?? "",
      },
      coverage: nextCoverage ?? null,
      updatedAt: Date.now(),
      isReadyToSubmit: nextReadyToSubmit,
    };

    saveChatDraft(draftUserId, draft);
  };

  useEffect(() => {
    if (!draftUserId || !hasHydratedDraft) return;

    const timeoutId = window.setTimeout(() => {
      persistDraftSnapshot({
        nextMessages: messagesRef.current,
        nextParsedData: watchedFormValues,
        nextCoverage: coverageRef.current,
        nextReadyToSubmit: readyToSubmitRef.current,
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draftUserId, hasHydratedDraft, serializedFormValues]);

  const chatMutation = useMutation({
    mutationFn: async (newHistory: Message[]) => {
      const outboundHistory = boundOutboundHistory(newHistory);
      const currentParsedData = getValues();
      const response = await fetch("/api/ai/chat-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: outboundHistory.map((message) => ({ role: message.role, content: message.content })),
          context: {
            parsedData: currentParsedData,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, "Lỗi khi kết nối AI."));
      return data;
    },
    onSuccess: (data, sentHistory) => {
      const nextCoverage = isCoverageReport(data.coverage) ? data.coverage : coverage;
      const nextReadyToSubmit =
        typeof data.isReadyToSubmit === "boolean" ? data.isReadyToSubmit : isCoverageComplete(nextCoverage);
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content:
          data.message ||
          (nextReadyToSubmit
            ? "Brief đã đủ điều kiện để bạn chốt đăng dự án."
            : "Mình đã cập nhật brief, bạn tiếp tục bổ sung giúp mình nhé."),
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      };
      const nextMessages = [...sentHistory, assistantMessage];
      const currentValues = getValues();
      let nextFormValues = currentValues;

      setMessages(nextMessages);
      setCoverage(nextCoverage ?? null);
      setChatReadyToSubmit(nextReadyToSubmit);

      if (data.parsedData) {
        const patch = buildProjectFormPrefillPatch({
          parsedData: data.parsedData,
          currentValues,
          dirtyFields,
        });

        nextFormValues = { ...currentValues, ...patch };
        Object.entries(patch).forEach(([key, val]) => {
          setValue(key as keyof ProjectFormInput, val, { shouldValidate: true, shouldDirty: false });
        });
      }

      persistDraftSnapshot({
        nextMessages,
        nextParsedData: nextFormValues,
        nextCoverage: nextCoverage ?? null,
        nextReadyToSubmit,
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  });

  const handleSendMessage = (text: string) => {
    if (!text.trim() || chatMutation.isPending) return;

    hasUserInteractedRef.current = true;
    const newMsg: Message = { id: `${Date.now()}-user`, role: "user", content: text };
    const nextMessages = [...messages, newMsg];
    setMessages(nextMessages);
    setChatInput("");
    persistDraftSnapshot({
      nextMessages,
      nextParsedData: getValues(),
      nextCoverage: coverage,
      nextReadyToSubmit: chatReadyToSubmit,
    });
    chatMutation.mutate(nextMessages);
  };

  const handleResetChat = () => {
    hasUserInteractedRef.current = true;
    setMessages(INITIAL_MESSAGES);
    setChatInput("");
    setCoverage(null);
    setChatReadyToSubmit(false);
    reset(INITIAL_FORM_VALUES);
    if (draftUserId) {
      clearChatDraft(draftUserId);
      pendingDraftClearRef.current = false;
    } else {
      pendingDraftClearRef.current = true;
    }
    chatMutation.reset();
  };

  const createProjectMutation = useMutation({
    mutationFn: async (values: ProjectFormInput) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, "Có lỗi khi đăng bài."));
      return data;
    },
    onSuccess: async () => {
      if (draftUserId) {
        clearChatDraft(draftUserId);
      }
      await queryClient.invalidateQueries({ queryKey: ["sme-projects"] });
      toast.success("Dự án đã được tạo thành công!");
      router.push("/sme/projects");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Có lỗi khi đăng bài.");
    },
  });

  const onSubmit = handleSubmit((values) => {
    createProjectMutation.mutate(values);
  });

  const progressState = deriveChatProgressState(coverage, chatReadyToSubmit);

  return (
    <div className="space-y-8 pb-12 fade-in">
      <header className="portal-shell p-6 md:p-8">
        <div className="space-y-2">
          <p className="portal-kicker">Project creation wizard</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Tạo brief dự án cùng trợ lý AI</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            Trò chuyện với AI để làm rõ yêu cầu, sau đó kiểm tra form chuẩn hóa trước khi đăng dự án.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <section className="portal-panel flex h-[700px] flex-col overflow-hidden lg:col-span-5">
          <div className="space-y-3 border-b border-border/70 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">
                  <Sparkles className="h-4 w-4 text-emerald-700" />
                  AI Brief Assistant
                </h2>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  {progressState.progressLabel}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
                    progressState.isReadyToSubmit
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700",
                  )}
                >
                  {progressState.statusLabel}
                </span>
                <Button
                  disabled={chatMutation.isPending || createProjectMutation.isPending}
                  onClick={handleResetChat}
                  size="xs"
                  type="button"
                  variant="outline"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Làm lại
                </Button>
              </div>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className={cn(
                  "h-full transition-[width] duration-300",
                  progressState.isReadyToSubmit ? "bg-emerald-500" : "bg-amber-500",
                )}
                style={{ width: `${progressState.percentage}%` }}
              />
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-4">
            {messages.map((msg, index) => (
              <div
                className={cn(
                  "flex max-w-[92%] flex-col",
                  msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start",
                )}
                key={msg.id}
              >
                <div
                  className={cn(
                    "rounded-2xl border px-3 py-2 text-sm leading-6",
                    msg.role === "user"
                      ? "rounded-br-sm border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "rounded-bl-sm border-border bg-white text-slate-700",
                  )}
                >
                  {msg.content}
                </div>

                {msg.role === "assistant" && msg.suggestions && msg.suggestions.length > 0 && index === messages.length - 1 ? (
                  <div className="mb-2 mt-3 flex flex-wrap gap-2">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                        disabled={chatMutation.isPending}
                        key={i}
                        onClick={() => handleSendMessage(sug)}
                        type="button"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {chatMutation.isPending ? (
              <div className="flex max-w-[92%] items-start">
                <div className="rounded-2xl rounded-bl-sm border border-border bg-white p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border/70 bg-white p-4">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(chatInput);
              }}
            >
              <Input
                className="rounded-full border-border bg-white"
                disabled={chatMutation.isPending}
                onChange={(e) => {
                  hasUserInteractedRef.current = true;
                  setChatInput(e.target.value);
                }}
                placeholder="Nhập câu trả lời..."
                value={chatInput}
              />
              <Button
                className="rounded-full border-0 bg-emerald-700 text-white hover:bg-emerald-800"
                disabled={!chatInput.trim() || chatMutation.isPending}
                size="icon"
                type="submit"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </section>

        <form className="portal-panel flex flex-col gap-6 p-6 lg:col-span-7" onSubmit={onSubmit}>
          <div className="mb-1 flex items-center justify-between border-b border-border/70 pb-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              Form chuẩn hóa dự án
            </h2>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
              Live prefill
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label className="font-semibold" htmlFor="title">Tên dự án</Label>
              <Input id="title" placeholder="Sẽ tự động điền bởi AI" {...register("title")} />
              <FieldError message={errors.title?.message} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center font-semibold text-indigo-700" htmlFor="standardizedBrief">
                Mô tả chuẩn hóa
                <Sparkles className="ml-1 h-3 w-3" />
              </Label>
              <Textarea
                className="min-h-[100px] border-indigo-200 bg-indigo-50/50"
                id="standardizedBrief"
                placeholder="AI sẽ sinh mô tả dự án rõ mục tiêu, phạm vi, đầu ra và tiêu chí đánh giá"
                {...register("standardizedBrief")}
              />
              <FieldError message={errors.standardizedBrief?.message} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-semibold" htmlFor="description">Mô tả hội thoại thô</Label>
              <Textarea className="h-20 bg-slate-50 text-xs" id="description" readOnly {...register("description")} />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="expectedOutput">Kết quả bàn giao</Label>
              <Input id="expectedOutput" placeholder="VD: Website, báo cáo, dashboard..." {...register("expectedOutput")} />
              <FieldError message={errors.expectedOutput?.message} />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="requiredSkills">Kỹ năng cần có</Label>
              <Input id="requiredSkills" placeholder="VD: React, Node.js, UI/UX..." {...register("requiredSkills")} />
              <FieldError message={errors.requiredSkills?.message} />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="difficulty">Mức độ khó</Label>
              <Controller
                control={control}
                name="difficulty"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Dễ (1-2 tuần)</SelectItem>
                      <SelectItem value="MEDIUM">Vừa (2-4 tuần)</SelectItem>
                      <SelectItem value="HARD">Khó (4-8 tuần)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="duration">Thời gian triển khai</Label>
              <Input id="duration" placeholder="VD: 3 tuần" {...register("duration")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-semibold" htmlFor="budget">Ngân sách / Quyền lợi</Label>
              <Input id="budget" placeholder="VD: 5-10 triệu VNĐ hoặc quyền lợi tương đương" {...register("budget")} />
              <FieldError message={errors.budget?.message} />
            </div>
          </div>

          <Button
            className="mt-2 h-12 w-full rounded-full border-0 bg-emerald-700 text-base font-semibold text-white hover:bg-emerald-800"
            disabled={createProjectMutation.isPending}
            type="submit"
          >
            {createProjectMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Đăng dự án"}
          </Button>
        </form>
      </div>
    </div>
  );
}
