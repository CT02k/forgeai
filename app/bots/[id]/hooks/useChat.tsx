import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ChatMessage, ChatSessionSummary } from "@/app/types";

type UseChatOptions = {
  botId: string;
  chatId?: string | null;
  onChatChange?: (chatId?: string) => void;
};

export default function useChat({
  botId,
  chatId,
  onChatChange,
}: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(
    chatId ?? undefined,
  );
  const [prefersNewChat, setPrefersNewChat] = useState(false);

  useEffect(() => {
    setActiveChatId(chatId ?? undefined);
    if (chatId) {
      setPrefersNewChat(false);
    }
  }, [chatId]);

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch("/api/chat/sessions");
      if (!response.ok) {
        throw new Error("Could not load previous chats.");
      }

      const data = (await response.json()) as {
        sessions: ChatSessionSummary[];
      };

      setErrorMessage(null);
      setSessions(data.sessions);
    } catch (error) {
      console.error("[CHAT_SESSIONS]", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load your chats.",
      );
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const loadMessages = useCallback(
    async (targetChatId: string, silent?: boolean) => {
      if (!targetChatId) {
        setMessages([]);
        return;
      }

      if (!silent) {
        setMessages([]);
        setLoadingHistory(true);
      }

      try {
        const response = await fetch(`/api/chat/sessions/${targetChatId}`);
        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}));
          throw new Error(errorPayload?.error || "Cannot load chat history.");
        }

        const data = (await response.json()) as {
          session: { messages: ChatMessage[] };
        };

        setErrorMessage(null);
        setMessages(
          data.session.messages.map((msg) => ({
            ...msg,
            role: msg.role,
          })),
        );
      } catch (error) {
        console.error("[CHAT_HISTORY]", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not load chat history.",
        );
      } finally {
        if (!silent) {
          setLoadingHistory(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId, loadMessages]);

  useEffect(() => {
    if (prefersNewChat || activeChatId || sessions.length === 0) {
      return;
    }

    const sessionForBot = sessions.find((session) => session.bot.id === botId);
    if (sessionForBot) {
      setActiveChatId(sessionForBot.id);
      onChatChange?.(sessionForBot.id);
    }
  }, [activeChatId, botId, onChatChange, prefersNewChat, sessions]);

  const processMessage = useCallback(
    async (messageToSend: string) => {
      const trimmedMessage = messageToSend.trim();
      if (!trimmedMessage || loadingMessage) return;

      const previousMessagesLength = messages.length;
      const optimisticMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: trimmedMessage },
      ];

      setMessages(optimisticMessages);
      setLoadingMessage(true);
      setErrorMessage(null);
      setRetryMessage(null);
      setPrefersNewChat(false);
      scrollChatToBottom();

      try {
        const response = await fetch(`/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmedMessage,
            botId,
            chatId: activeChatId,
          }),
        });

        if (!response.ok) {
          let serverMessage = "Cannot generate a response.";
          try {
            const data = await response.json();
            serverMessage = data?.error || serverMessage;
          } catch {
            serverMessage = response.statusText || serverMessage;
          }
          throw new Error(serverMessage);
        }

        if (!response.body) {
          throw new Error("Empty response from server.");
        }

        const chatIdFromResponse =
          response.headers.get("x-chat-id") || activeChatId;

        if (chatIdFromResponse && chatIdFromResponse !== activeChatId) {
          setActiveChatId(chatIdFromResponse);
          onChatChange?.(chatIdFromResponse);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          botContent += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            const botIndex =
              last && last.role === "bot" ? updated.length - 1 : undefined;

            if (botIndex !== undefined) {
              updated[botIndex] = { role: "bot", content: botContent };
            } else {
              updated.push({ role: "bot", content: botContent });
            }
            return updated;
          });
          scrollChatToBottom();
        }

        setMessages((prev) => {
          const updated = [...prev];
          const botIndex = updated.length - 1;
          if (botIndex >= 0 && updated[botIndex].role === "bot") {
            updated[botIndex] = { role: "bot", content: botContent };
          }
          return updated;
        });

        await fetchSessions();
        if (chatIdFromResponse) {
          await loadMessages(chatIdFromResponse, true);
        }
        setLoadingMessage(false);
      } catch (error) {
        setMessages((prev) => prev.slice(0, previousMessagesLength));
        setLoadingMessage(false);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not send the message.",
        );
        setRetryMessage(trimmedMessage);
      }
    },
    [
      activeChatId,
      botId,
      fetchSessions,
      loadMessages,
      loadingMessage,
      messages,
      onChatChange,
    ],
  );

  const handleSendMessage = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
        const userMessage = e.currentTarget.value;
        e.currentTarget.value = "";
        await processMessage(userMessage);
      }
    },
    [processMessage],
  );

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setLoadingMessage(false);
    setLoadingHistory(false);
    setErrorMessage(null);
    setRetryMessage(null);
    setActiveChatId(undefined);
    setPrefersNewChat(true);
    onChatChange?.(undefined);
  }, [onChatChange]);

  const handleDeleteChat = useCallback(
    async (sessionId: string) => {
      try {
        const response = await fetch(`/api/chat/sessions/${sessionId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || "Could not delete chat.");
        }

        setSessions((prev) =>
          prev.filter((session) => session.id !== sessionId),
        );

        if (activeChatId === sessionId) {
          setActiveChatId(undefined);
          onChatChange?.(undefined);
          setMessages([]);
        }
      } catch (error) {
        console.error("[CHAT_DELETE]", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Could not delete chat.",
        );
      }
    },
    [activeChatId, onChatChange],
  );

  const handleRetry = useCallback(() => {
    if (!retryMessage || loadingMessage) return;
    processMessage(retryMessage);
  }, [loadingMessage, processMessage, retryMessage]);

  const isHistoryLoading = useMemo(
    () => loadingHistory && messages.length === 0,
    [loadingHistory, messages.length],
  );

  return {
    sessions,
    messages,
    loadingMessage,
    loadingSessions,
    loadingHistory: isHistoryLoading,
    activeChatId,
    handleSendMessage,
    handleClearChat,
    handleDeleteChat,
    errorMessage,
    retryMessage,
    handleRetry,
  };
}

function scrollChatToBottom() {
  const chatContainer = document.getElementById("chat-container");
  chatContainer?.scrollTo(0, chatContainer.scrollHeight);
}
