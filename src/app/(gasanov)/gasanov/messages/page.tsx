"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Calendar,
  FileText,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDateShort, formatTime } from "@/lib/utils/date";
import { ScrollArea } from "@/components/ui/scroll-area";

// Для сообщений из API /api/gasanov/messages (camelCase от Prisma)
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageText: string | null;
  attachments: Array<{ filename: string; url: string; size: number }> | null;
  isRead: boolean;
  createdAt: string;
}

// Для последнего сообщения в списке бесед (snake_case от API)
interface LastMessage {
  message_text: string;
  created_at: string;
  sender_id: string;
  is_read: boolean;
}

interface Conversation {
  conversation_id: string;
  user_id: string;
  lawyer_id: string;
  case_id: string | null;
  conversation_type: "general" | "case";
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  last_message?: LastMessage;
  unread_count?: number;
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadConversations(true); // Показываем загрузку только при первом открытии
  }, []);

  // Автообновление каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations();
      if (selectedConversation) {
        loadMessages(selectedConversation);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadConversations = async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await fetch("/api/gasanov/conversations");
      const data = await res.json();
      if (res.ok) {
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/gasanov/messages?conversation_id=${conversationId}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    // Находим текущую беседу для получения user_id
    const currentConv = conversations.find(c => c.conversation_id === selectedConversation);
    
    setIsSending(true);
    try {
      const res = await fetch("/api/gasanov/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: selectedConversation,
          message_text: newMessage.trim(),
          receiver_id: currentConv?.user_id || null, // Добавляем получателя
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNewMessage("");
        loadMessages(selectedConversation);
        loadConversations();
      } else {
        alert(data.error || "Ошибка отправки сообщения");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Ошибка отправки сообщения");
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.user_name?.toLowerCase().includes(query) ||
      conv.user_email?.toLowerCase().includes(query) ||
      conv.last_message?.message_text?.toLowerCase().includes(query)
    );
  });

  const currentConversation = conversations.find(
    (c) => c.conversation_id === selectedConversation
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Сообщения с клиентами</h1>
        <p className="text-muted-foreground">
          Управление перепиской с клиентами
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Список бесед */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по клиентам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  Нет бесед
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.conversation_id}
                      onClick={() => setSelectedConversation(conv.conversation_id)}
                      className={`w-full p-4 text-left hover:bg-secondary transition-colors ${
                        selectedConversation === conv.conversation_id
                          ? "bg-secondary"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                          {conv.user_name?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm truncate">
                              {conv.user_name || "Без имени"}
                            </p>
                            {conv.unread_count && conv.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {conv.user_email}
                          </p>
                          {conv.last_message && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.last_message.message_text || "Вложение"}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateShort(conv.updated_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Переписка */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedConversation && currentConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center">
                    {currentConversation.user_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {currentConversation.user_name || "Клиент"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {currentConversation.user_email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-full p-6">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        Нет сообщений
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isAdmin = msg.senderId !== currentConversation.user_id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isAdmin
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">
                                {msg.messageText}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p
                                  className={`text-xs ${
                                    isAdmin
                                      ? "text-primary-foreground/70"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {formatTime(msg.createdAt)}
                                </p>
                                {isAdmin && msg.isRead && (
                                  <CheckCircle className="h-3 w-3 text-primary-foreground/70" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  </ScrollArea>
                </div>
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Напишите сообщение..."
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSending}
                      size="icon"
                      className="shrink-0"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Выберите беседу для просмотра сообщений</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

