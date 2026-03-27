import { prisma } from "@/modules/shared/kernel/prisma";
import { AIInsights } from "../types/assistant";

export class AssistantRepo {
  static async getChatHistory(projectProgressId: string) {
    return await prisma.chatMessage.findMany({
      where: { projectProgressId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async saveChatMessage(projectProgressId: string, senderId: string, role: 'user' | 'assistant', content: string) {
    return await prisma.chatMessage.create({
      data: {
        projectProgressId,
        senderId,
        role,
        content,
      },
    });
  }

  static async updateAIInsights(projectProgressId: string, insights: AIInsights) {
    return await prisma.projectProgress.update({
      where: { id: projectProgressId },
      data: {
        aiInsights: insights as any,
      },
    });
  }

  static async getProjectContext(projectProgressId: string) {
    return await prisma.projectProgress.findUnique({
      where: { id: projectProgressId },
      include: {
        project: true,
      },
    });
  }
}
