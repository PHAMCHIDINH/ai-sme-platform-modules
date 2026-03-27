export interface ChatMessage {
  id: string;
  projectProgressId: string;
  senderId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface AIInsights {
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  bottlenecks?: string[];
  resourceSuggestions?: {
    title: string;
    url: string;
    description: string;
  }[];
  risks?: string[];
  deadlineWarning?: string;
}

export interface AssistantState {
  messages: ChatMessage[];
  isLoading: boolean;
  insights?: AIInsights;
}
