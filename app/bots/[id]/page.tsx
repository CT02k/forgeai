"use client";

import { use } from "react";

import useBot from "./hooks/useBot";
import useChat from "./hooks/useChat";

import BotHeader from "./BotHeader";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";

export default function BotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { bot, loading } = useBot(id);
  const { messages, loadingMessage, handleSendMessage } = useChat(id);

  return (
    <main className="flex flex-col h-screen items-center justify-center">
      {!loading && bot ? (
        <div className="w-1/2 bg-zinc-900 rounded-lg flex flex-col h-2/3">
          <BotHeader bot={bot} />
          <ChatWindow messages={messages} loadingMessage={loadingMessage} />
          <ChatInput
            loadingMessage={loadingMessage}
            onSendMessage={handleSendMessage}
          />
        </div>
      ) : (
        <div className="size-16 border-b-4 border-l-4 border-white rounded-full animate-spin"></div>
      )}
    </main>
  );
}
