import { openaiInstance, chatModelStr } from "@/modules/ai/services/openai";
import { AIInsights } from "../types/assistant";

export class AssistantService {
  static async generateInsights(
    projectTitle: string,
    projectDescription: string,
    updates: any[],
    milestones: any[]
  ): Promise<AIInsights> {
    if (!openaiInstance) {
      return { summary: "AI service is currently unavailable." };
    }

    const context = `
      Project: ${projectTitle}
      Description: ${projectDescription}
      Current Updates: ${JSON.stringify(updates)}
      Milestones: ${JSON.stringify(milestones)}
    `;

    try {
      const completion = await openaiInstance.chat.completions.create({
        model: chatModelStr,
        messages: [
          {
            role: "system",
            content: `You are an AI Project Assistant for the AI SME Platform. 
            Analyze the project progress and provide insights in JSON format.
            The JSON should include:
            - summary: A brief summary of the current progress.
            - sentiment: 'positive', 'neutral', or 'negative' based on updates.
            - bottlenecks: Array of strings identifying potential issues.
            - resourceSuggestions: Array of {title, url, description} for helpful resources.
            - risks: Array of strings for project risks.
            - deadlineWarning: A warning message if deadlines are approaching or missed.
            Respond ONLY with the JSON object.`,
          },
          {
            role: "user",
            content: `Analyze this project context and provide insights:\n${context}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      return content ? JSON.parse(content) : {};
    } catch (error) {
      console.error("Error generating AI insights:", error);
      return { summary: "Failed to generate AI insights." };
    }
  }

  static async getChatResponse(
    projectTitle: string,
    history: { role: 'user' | 'assistant', content: string }[],
    userMessage: string
  ): Promise<string> {
    if (!openaiInstance) {
      return "I'm sorry, I'm having trouble connecting to my brain right now.";
    }

    try {
      const completion = await openaiInstance.chat.completions.create({
        model: chatModelStr,
        messages: [
          {
            role: "system",
            content: `You are an AI Project Assistant for the AI SME Platform. 
            You are helping a student or an SME with their project: "${projectTitle}".
            Be professional, helpful, and encouraging. 
            Provide actionable advice, clarify project requirements, and help resolve conflicts or technical blockers.`,
          },
          ...history,
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || "I'm not sure how to respond to that.";
    } catch (error) {
      console.error("Error getting AI chat response:", error);
      return "An error occurred while processing your request.";
    }
  }
}
