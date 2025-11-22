import axios from "axios";
import { useEffect, useState } from "react";

type ChatMessage = { role: "user" | "bot"; content: string };

export default function useChat(id: string) {
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  const storeKey = `chat_history_${id}`;

  useEffect(() => {
    async function loadHistory() {
      const storedHistory = localStorage.getItem(storeKey);
      if (storedHistory) {
        setMessages(JSON.parse(storedHistory));
      }
    }

    loadHistory();
  }, [storeKey]);

  async function handleSendMessage(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      const userMessage = e.currentTarget.value;
      e.currentTarget.value = "";
      processMessage(userMessage);
    }
  }

  async function processMessage(messageToSend: string) {
    const trimmedMessage = messageToSend.trim();
    if (!trimmedMessage) return;

    const optimisticMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmedMessage },
    ];

    setMessages(optimisticMessages);
    setLoadingMessage(true);
    setErrorMessage(null);
    setRetryMessage(null);
    scrollChatToBottom();

    try {
      const response = await axios.post(`/api/chat/`, {
        message: trimmedMessage,
        botId: id,
        history: optimisticMessages.slice(-10),
      });
      const data = await response.data;

      if (response.status !== 200 || data.error) {
        throw new Error(data?.error || "Cannot generate a response.");
      }

      setMessages((prev) => {
        const updated = [
          ...prev,
          { role: "bot", content: data.answer } as const,
        ];
        localStorage.setItem(storeKey, JSON.stringify(updated));
        scrollChatToBottom();
        return updated;
      });
      setLoadingMessage(false);
    } catch (error) {
      setMessages((prev) => prev.slice(0, -1));
      setLoadingMessage(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar a mensagem.",
      );
      setRetryMessage(trimmedMessage);
    }
  }

  function scrollChatToBottom() {
    const chatContainer = document.getElementById("chat-container");
    chatContainer?.scrollTo(0, chatContainer.scrollHeight);
  }

  function handleClearChat() {
    setMessages([]);
    setLoadingMessage(false);
    setErrorMessage(null);
    setRetryMessage(null);
    localStorage.removeItem(storeKey);
  }

  function handleRetry() {
    if (!retryMessage || loadingMessage) return;
    processMessage(retryMessage);
  }

  return {
    messages,
    loadingMessage,
    handleSendMessage,
    handleClearChat,
    errorMessage,
    retryMessage,
    handleRetry,
  };
}
