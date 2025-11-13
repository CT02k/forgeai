import { useState } from "react";

export default function useChat(id: string) {
  const [loadingMessage, setLoadingMessage] = useState(false);

  const [messages, setMessages] = useState<
    { role: "user" | "bot"; content: string }[]
  >([]);

  const storeKey = `chat_history_${id}`;

  async function handleSendMessage(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      const userMessage = e.currentTarget.value;
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
      e.currentTarget.value = "";
      setLoadingMessage(true);
      scrollChatToBottom();
      const response = await fetch(`/api/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          botId: id,
          history: messages
            .filter((msg) => msg.content !== userMessage)
            .slice(-10),
        }),
      });
      const data = await response.json();
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
    }
  }

  function scrollChatToBottom() {
    const chatContainer = document.getElementById("chat-container");
    chatContainer?.scrollTo(0, chatContainer.scrollHeight);
  }

  return {
    messages,
    loadingMessage,
    handleSendMessage,
    setMessages,
  };
}
