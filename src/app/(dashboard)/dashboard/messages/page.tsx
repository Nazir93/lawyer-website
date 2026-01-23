"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  User,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils/date";

interface Conversation {
  conversation_id: string;
  conversation_type: string;
  case_id: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  participant: {
    id: string | null;
    name: string;
    email: string | null;
  };
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  message_text: string;
  attachments: Array<{ filename: string; url: string; type: string; size: number }>;
  created_at: string;
  is_read: boolean;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversation_id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadCurrentUser = async () => {
    try {
      const res = await fetch("/api/users/me");
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUserId(data.user.id);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/dashboard/conversations");
      const data = await res.json();
      
      if (res.ok) {
        setConversations(data.data || []);
        if (data.data && data.data.length > 0 && !selectedConversation) {
          setSelectedConversation(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/dashboard/messages?conversation_id=${conversationId}`);
      const data = await res.json();
      
      if (res.ok) {
        setMessages(data.data || []);
        
        // Отмечаем сообщения как прочитанные
        const unreadIds = data.data
          .filter((m: Message) => !m.is_read && m.receiver_id === currentUserId)
          .map((m: Message) => m.id);
        
        if (unreadIds.length > 0) {
          await fetch("/api/dashboard/messages", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageIds: unreadIds }),
          });
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;
    
    setIsSending(true);
    try {
      const res = await fetch("/api/dashboard/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: selectedConversation.conversation_id,
          message_text: newMessage,
          conversation_type: selectedConversation.conversation_type,
          case_id: selectedConversation.case_id,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setNewMessage("");
        loadMessages(selectedConversation.conversation_id);
        loadConversations(); // Обновляем список бесед
      } else {
        toast.error(data.error || "Ошибка отправки сообщения");
      }
    } catch (error) {
      toast.error("Ошибка отправки сообщения");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex h-full rounded-2xl border border-border overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-medium mb-3">Сообщения</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск"
                className="pl-9 rounded-full bg-secondary/50 border-0"
              />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Нет бесед
                </div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.conversation_id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-colors",
                      selectedConversation?.conversation_id === conversation.conversation_id
                        ? "bg-secondary"
                        : "hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
                          {conversation.participant.name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">
                            {conversation.participant.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(conversation.last_message_time)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <Badge className="shrink-0 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          {selectedConversation ? (
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
                    {selectedConversation.participant.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="font-medium">{selectedConversation.participant.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.conversation_type === 'case' ? 'Дело' : 'Общая беседа'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-border text-center text-muted-foreground">
              Выберите беседу
            </div>
          )}

          {/* Messages */}
          {selectedConversation && (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Нет сообщений
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.sender_id === currentUserId;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-3",
                          isMe ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isMe && (
                          <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium shrink-0">
                            {selectedConversation.participant.name.charAt(0)}
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-md rounded-2xl px-4 py-2",
                            isMe
                              ? "bg-foreground text-background"
                              : "bg-secondary"
                          )}
                        >
                          <p className="text-sm">{message.message_text}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((att, idx) => (
                                <div key={idx} className="p-2 rounded-lg bg-background/10 flex items-center gap-2">
                                  <Paperclip className="h-4 w-4" />
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs hover:underline"
                                  >
                                    <p className="font-medium">{att.filename}</p>
                                    <p className="opacity-70">{(att.size / 1024).toFixed(1)} KB</p>
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                          <p
                            className={cn(
                              "text-xs mt-1",
                              isMe
                                ? "text-background/50"
                                : "text-muted-foreground"
                            )}
                          >
                            {formatDateTime(message.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Input */}
          {selectedConversation && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Написать сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 rounded-full"
                  disabled={isSending}
                />
                <Button 
                  size="icon" 
                  className="rounded-full"
                  onClick={handleSendMessage}
                  disabled={isSending || !newMessage.trim()}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

