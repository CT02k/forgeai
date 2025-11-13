"use client";

import { Bot } from "@/app/types";

import { use, useEffect, useState } from "react";

import Image from "next/image";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [bot, setBot] = useState<Bot>();

  const [messages, setMessages] = useState<
    { role: "user" | "bot"; content: string }[]
  >([]);

  const storeKey = `chat_history_${id}`;

  useEffect(() => {
    async function fetchBot() {
      const response = await fetch(`/api/bots/${id}`);
      const data = await response.json();
      setBot(data);
      setLoading(false);
      const storedHistory = localStorage.getItem(storeKey);
      if (storedHistory) {
        setMessages(JSON.parse(storedHistory));
      }
    }

    fetchBot();
  }, [id, storeKey]);

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

  return (
    <main className="flex flex-col h-screen items-center justify-center">
      {!loading && bot ? (
        <div className="w-1/2 bg-zinc-900 rounded-lg flex flex-col h-2/3">
          <div className="flex rounded-t-lg bg-zinc-800 p-3 items-center gap-5">
            <Image
              src={bot.avatar}
              alt={`${bot.name} Avatar`}
              width={64}
              height={64}
              className="rounded-full size-12"
            />
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-white">{bot.name}</h2>
              <p className="text-sm text-zinc-400">{bot.description}</p>
            </div>
          </div>
          <div
            className="flex flex-col grow overflow-y-auto py-4 scroll-smooth"
            id="chat-container"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 my-2 rounded-lg mx-6 markdown w-fit max-w-[90%] ${
                  message.role === "user"
                    ? "bg-white ml-16 self-end"
                    : "bg-zinc-800 text-white mr-16 self-start"
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            ))}
            {loadingMessage && (
              <div className="p-4 my-2 rounded-lg mx-3 bg-zinc-800 text-white mr-16 py-5.5 animate-pulse flex gap-2">
                <div className="size-3 bg-white rounded-full"></div>
                <div className="size-3 bg-white rounded-full"></div>
                <div className="size-3 bg-white rounded-full"></div>
              </div>
            )}
          </div>
          <div className="h-14 bg-zinc-800 rounded-b-lg">
            <input
              type="text"
              disabled={loadingMessage}
              className={`w-full h-full p-4 outline-none rounded-lg placeholder:text-zinc-500 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-pulse`}
              placeholder="Type your message..."
              onKeyDown={handleSendMessage}
            />
          </div>
        </div>
      ) : (
        <div className="size-16 border-b-4 border-l-4 border-white rounded-full animate-spin"></div>
      )}
    </main>
  );
}
