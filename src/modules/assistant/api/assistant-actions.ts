"use server";

import { auth } from "@/auth";
import { AssistantRepo } from "../repo/assistant-repo";
import { AssistantService } from "../services/assistant-service";
import { AIInsights } from "../types/assistant";

export async function sendMessage(projectProgressId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // 1. Save user message
  await AssistantRepo.saveChatMessage(projectProgressId, userId, "user", content);

  // 2. Get project context and history
  const context = await AssistantRepo.getProjectContext(projectProgressId);
  if (!context) {
    throw new Error("Project progress not found");
  }

  const history = await AssistantRepo.getChatHistory(projectProgressId);
  const formattedHistory = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // 3. Get AI response
  const aiResponse = await AssistantService.getChatResponse(
    context.project.title,
    formattedHistory,
    content
  );

  // 4. Save AI message
  const savedAiMessage = await AssistantRepo.saveChatMessage(
    projectProgressId,
    userId, // AI message is associated with the project but let's use the user who triggered it as a reference for now, or use a system ID
    "assistant",
    aiResponse
  );

  return savedAiMessage;
}

export async function refreshInsights(projectProgressId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const context = await AssistantRepo.getProjectContext(projectProgressId);
  if (!context) {
    throw new Error("Project progress not found");
  }

  const insights = await AssistantService.generateInsights(
    context.project.title,
    context.project.description,
    context.updates as any[],
    context.milestones as any[]
  );

  await AssistantRepo.updateAIInsights(projectProgressId, insights);
  return insights;
}

export async function getChatHistory(projectProgressId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await AssistantRepo.getChatHistory(projectProgressId);
}
