"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/modules/shared/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/modules/shared/ui/card";
import { Input } from "@/modules/shared/ui/input";
import { ScrollArea } from "@/modules/shared/ui/scroll-area";
import { Avatar } from "@/modules/shared/ui/avatar";
import { Badge } from "@/modules/shared/ui/badge";
import { MessageSquare, Send, X, Bot, User, RefreshCw, AlertCircle } from "lucide-react";
import { sendMessage, getChatHistory, refreshInsights } from "../api/assistant-actions";
import { AIInsights, ChatMessage } from "../types/assistant";

interface ChatbotProps {
  projectProgressId: string;
  initialInsights?: AIInsights;
}

export const Chatbot: React.FC<ChatbotProps> = ({ projectProgressId, initialInsights }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsights | undefined>(initialInsights);
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadHistory = async () => {
    try {
      const history = await getChatHistory(projectProgressId);
      setMessages(history as any);
    } catch (error) {
      console.error("Failed to load chat history", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // Optimistic update
      const tempUserMsg: any = {
        id: Date.now().toString(),
        role: 'user',
        content: userMsg,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, tempUserMsg]);

      await sendMessage(projectProgressId, userMsg);
      await loadHistory();
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshInsights = async () => {
    setIsRefreshingInsights(true);
    try {
      const newInsights = await refreshInsights(projectProgressId);
      setInsights(newInsights);
    } catch (error) {
      console.error("Failed to refresh insights", error);
    } finally {
      setIsRefreshingInsights(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 shadow-lg flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-80 md:w-96 h-[500px] flex flex-col shadow-2xl border-primary/20">
          <CardHeader className="p-3 bg-primary text-primary-foreground flex flex-row items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">AI Project Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
            <div className="p-2 border-b bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase text-muted-foreground">AI Insights</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefreshInsights}
                  disabled={isRefreshingInsights}
                  className="h-6 w-6"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingInsights ? "animate-spin" : ""}`} />
                </Button>
              </div>
              {insights?.summary ? (
                <div className="text-xs space-y-1">
                  <p className="line-clamp-2 italic">"{insights.summary}"</p>
                  {insights.sentiment && (
                    <Badge variant="outline" className="text-[10px] py-0">
                      Sentiment: {insights.sentiment}
                    </Badge>
                  )}
                  {insights.deadlineWarning && (
                    <div className="flex items-center gap-1 text-destructive font-semibold">
                      <AlertCircle className="w-3 h-3" />
                      <span>{insights.deadlineWarning}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground italic">No insights generated yet. Click refresh.</p>
              )}
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 && !isLoading && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <Bot className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>How can I help you with your project today?</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-2 max-w-[85%] ${
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar className="w-6 h-6 shrink-0 mt-1">
                        {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </Avatar>
                      <div
                        className={`p-2 rounded-lg text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted border"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <Avatar className="w-6 h-6 shrink-0 mt-1">
                        <Bot className="w-4 h-4" />
                      </Avatar>
                      <div className="p-2 rounded-lg text-sm bg-muted border animate-pulse">
                        Typing...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex w-full gap-2"
            >
              <Input
                placeholder="Ask assistant..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 h-9"
              />
              <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="h-9 w-9">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
