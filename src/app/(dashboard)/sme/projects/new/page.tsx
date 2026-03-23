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

export function deriveChatProgressState(coverage: ChatDraft["coverage"], isReadyToSubmit?: boolean | null) {
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Cùng Trợ Lý Tối Ưu Đề Bài</h2>
        <p className="text-muted-foreground text-sm font-medium mt-1">
          Chat với AI để được khai thác yêu cầu tự động, hoặc điền Form thủ công bên phải.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Chat Interface */}
        <div className="lg:col-span-5 h-[700px] flex flex-col bg-white border-2 border-black shadow-neo-md overflow-hidden rounded-xl">
          <div className="bg-cyan-300 border-b-2 border-black p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-bold flex items-center gap-2 uppercase">
                  <Sparkles className="w-5 h-5 text-black fill-current" /> AI Wizard
                </h3>
                <p className="text-[11px] font-black uppercase tracking-wide text-black/80">
                  {progressState.progressLabel}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border border-black px-2 py-1 text-[10px] font-black uppercase tracking-wide shadow-neo-sm",
                    progressState.isReadyToSubmit ? "bg-lime-300 text-black" : "bg-yellow-200 text-black",
                  )}
                >
                  {progressState.statusLabel}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleResetChat}
                  disabled={chatMutation.isPending || createProjectMutation.isPending}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Làm lại
                </Button>
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full border-2 border-black bg-white/70">
              <div
                className={cn(
                  "h-full transition-[width] duration-300",
                  progressState.isReadyToSubmit ? "bg-lime-300" : "bg-yellow-300",
                )}
                style={{ width: `${progressState.percentage}%` }}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/grid.svg')] bg-center">
            {messages.map((msg, index) => (
              <div key={msg.id} className={cn("flex flex-col max-w-[90%]", msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start")}>
                <div className={cn(
                  "p-3 rounded-2xl border-2 border-black text-sm",
                  msg.role === "user" 
                    ? "bg-lime-300 rounded-br-sm shadow-neo-sm" 
                    : "bg-white rounded-bl-sm shadow-neo-sm"
                )}>
                  {msg.content}
                </div>
                
                {msg.role === "assistant" && msg.suggestions && msg.suggestions.length > 0 && index === messages.length - 1 && (
                  <div className="flex flex-wrap gap-2 mt-3 mb-2">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(sug)}
                        disabled={chatMutation.isPending}
                        className="bg-yellow-300 hover:bg-yellow-400 border-2 border-black px-3 py-1.5 text-xs font-bold rounded-full shadow-neo-sm transition-transform active:translate-y-[2px] active:shadow-none"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex max-w-[90%] mr-auto items-start">
                <div className="p-3 bg-white rounded-2xl rounded-bl-sm border-2 border-black shadow-neo-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t-2 border-black">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(chatInput); }}
              className="flex gap-2"
            >
              <Input 
                value={chatInput}
                onChange={(e) => {
                  hasUserInteractedRef.current = true;
                  setChatInput(e.target.value);
                }}
                placeholder="Nhập câu trả lời..." 
                className="rounded-full shadow-neo-sm focus-visible:ring-0 focus-visible:bg-gray-50 bg-white"
                disabled={chatMutation.isPending}
              />
              <Button 
                type="submit" 
                disabled={!chatInput.trim() || chatMutation.isPending}
                size="icon" 
                className="rounded-full shadow-neo-sm hover:-translate-y-0.5 active:translate-y-[2px]"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Right Col: Form Interface */}
        <form onSubmit={onSubmit} className="lg:col-span-7 bg-white border-2 border-black p-6 rounded-xl shadow-neo-md gap-6 flex flex-col">
           <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-2">
            <h3 className="font-bold text-xl uppercase tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500 fill-current" /> Form Tự Động
            </h3>
            <span className="text-xs font-bold bg-pink-300 text-black px-2 py-1 border border-black shadow-neo-sm rounded-full">LIVE PREVIEW</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-2 space-y-2">
               <Label htmlFor="title" className="font-bold">Tên dự án</Label>
               <Input id="title" className="shadow-none bg-gray-50 focus-visible:bg-white" placeholder="Sẽ tự động điền bởi AI" {...register("title")} />
               <FieldError message={errors.title?.message} />
             </div>

             <div className="md:col-span-2 space-y-2">
               <Label htmlFor="standardizedBrief" className="font-bold flex items-center text-indigo-700">Mô tả chuẩn hoá <Sparkles className="w-3 h-3 ml-1" /></Label>
               <Textarea 
                id="standardizedBrief" 
                className="shadow-none bg-indigo-50/50 min-h-[100px] font-medium" 
                placeholder="AI sẽ sinh ra mô tả 4 bước chuyên nghiệp ở đây" 
                {...register("standardizedBrief")} 
               />
               <FieldError message={errors.standardizedBrief?.message} />
             </div>

             <div className="md:col-span-2 space-y-2">
               <Label htmlFor="description" className="font-bold">Nhật ký thô thuật (Ẩn với Dev)</Label>
               <Textarea id="description" className="shadow-none bg-gray-50 h-20 text-xs" readOnly {...register("description")} />
             </div>

             <div className="space-y-2">
               <Label htmlFor="expectedOutput" className="font-bold">Kết quả bàn giao</Label>
               <Input id="expectedOutput" className="shadow-none" placeholder="VD: Website, Báo cáo" {...register("expectedOutput")} />
               <FieldError message={errors.expectedOutput?.message} />
             </div>

             <div className="space-y-2">
               <Label htmlFor="requiredSkills" className="font-bold">Kỹ năng cần có</Label>
               <Input id="requiredSkills" className="shadow-none" placeholder="VD: React, Node.js" {...register("requiredSkills")} />
               <FieldError message={errors.requiredSkills?.message} />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="difficulty" className="font-bold">Mức độ khó</Label>
               <Controller
                 control={control}
                 name="difficulty"
                 render={({ field }) => (
                   <Select onValueChange={field.onChange} value={field.value}>
                     <SelectTrigger className="shadow-none bg-white">
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
               <Label htmlFor="duration" className="font-bold">Thời gian triển khai</Label>
               <Input id="duration" className="shadow-none" placeholder="VD: 3 tuần" {...register("duration")} />
             </div>

             <div className="md:col-span-2 space-y-2">
               <Label htmlFor="budget" className="font-bold">Ngân sách / Quyền lợi</Label>
               <Input id="budget" className="shadow-none" placeholder="VD: Bằng khen / 1tr VNĐ" {...register("budget")} />
               <FieldError message={errors.budget?.message} />
             </div>
           </div>

           <Button 
             className="w-full h-14 text-lg font-black uppercase tracking-widest bg-lime-400 hover:bg-lime-500 text-black border-2 border-black rounded-none shadow-neo-lg hover:shadow-neo-lg hover:-translate-y-1 active:translate-y-[2px] active:shadow-none transition-all mt-4" 
             disabled={createProjectMutation.isPending} 
             type="submit"
           >
             {createProjectMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Chốt Đăng Nhanh"}
           </Button>
        </form>
      </div>
    </div>
  );
}
