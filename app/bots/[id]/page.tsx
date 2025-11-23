"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import useBot from "./hooks/useBot";
import useChat from "./hooks/useChat";

import BotHeader from "./BotHeader";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import ChatHistorySidebar from "./ChatHistorySidebar";

export default function BotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get("chat");

  const { bot, loading, error } = useBot(id);
  const {
    sessions,
    messages,
    loadingMessage,
    loadingSessions,
    loadingHistory,
    activeChatId,
    handleSendMessage,
    handleClearChat,
    handleDeleteChat,
    errorMessage,
    retryMessage,
    handleRetry,
  } = useChat({
    botId: id,
    chatId: chatIdFromUrl,
    onChatChange: (newChatId) => {
      const query = newChatId ? `?chat=${newChatId}` : "";
      router.replace(`/bots/${id}${query}`);
    },
  });

  return (
    <main className="flex flex-col md:flex-row gap-4 pt-10 px-4 items-start">
      <ChatHistorySidebar
        sessions={sessions}
        activeChatId={activeChatId}
        currentBotId={id}
        loading={loadingSessions}
        onStartNewChat={handleClearChat}
        onDeleteChat={handleDeleteChat}
      />

      <div className="flex-1 flex flex-col items-center">
        {!loading && bot ? (
          <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col h-[80vh] min-h-[520px]">
            <BotHeader
              bot={bot}
              onClearChat={handleClearChat}
              canClear={!!(messages.length || activeChatId)}
            />
            <ChatWindow
              messages={messages}
              loadingMessage={loadingMessage}
              loadingHistory={loadingHistory}
            />
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
        ) : loading ? (
          <div className="size-16 border-b-4 border-l-4 border-white rounded-full animate-spin mt-10"></div>
        ) : (
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-center mt-6">
            <p className="text-lg font-semibold">
              {error || "Bot not available."}
            </p>
            <p className="text-sm text-zinc-400 mt-2">
              The bot may have been removed or is temporarily unavailable.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 px-4 py-2 bg-primary rounded-md text-white hover:opacity-80 transition"
            >
              Go back
            </Link>
          </div>
        )}
        <div className="px-4 pb-4 text-center text-xs text-zinc-300 mt-3">
          Powered by{" "}
          <a
            href="https://openai.com"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-100 underline underline-offset-2"
          >
            OpenAI
          </a>
        </div>
      </div>
    </main>
  );
}
