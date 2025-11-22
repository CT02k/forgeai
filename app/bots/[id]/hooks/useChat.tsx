import { useEffect, useState } from "react";

type ChatMessage = { role: "user" | "bot"; content: string };

export default function useChat(id: string) {
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  const storeKey = `chat_history_${id}`;

  useEffect(() => {
    const storedHistory = localStorage.getItem(storeKey);
    if (storedHistory) {
      setMessages(JSON.parse(storedHistory));
    }
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

    const previousMessagesLength = messages.length;
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
      const response = await fetch(`/api/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedMessage,
          botId: id,
          history: optimisticMessages.slice(-10),
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
        throw new Error("Resposta vazia do servidor.");
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
        localStorage.setItem(storeKey, JSON.stringify(updated));
        return updated;
      });
      setLoadingMessage(false);
    } catch (error) {
      setMessages((prev) => prev.slice(0, previousMessagesLength));
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
