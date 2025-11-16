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
  const {
    messages,
    loadingMessage,
    handleSendMessage,
    handleClearChat,
    errorMessage,
    retryMessage,
    handleRetry,
  } = useChat(id);

  return (
    <main className="flex flex-col h-screen items-center justify-center">
      {!loading && bot ? (
        <div className="w-1/2 bg-zinc-900 rounded-lg flex flex-col h-2/3">
          <BotHeader
            bot={bot}
            onClearChat={handleClearChat}
            canClear={messages.length > 0}
          />
          <ChatWindow messages={messages} loadingMessage={loadingMessage} />
          {errorMessage && (
            <div className="bg-red-500/10 text-red-300 text-sm flex items-center justify-between px-4 py-2">
              <span>{errorMessage}</span>
              {retryMessage && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={loadingMessage}
                  className="text-xs font-semibold px-3 py-1 border border-red-400 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Try again
                </button>
              )}
            </div>
          )}
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
