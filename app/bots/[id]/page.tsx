"use client";

import { use } from "react";
import Link from "next/link";

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

  const { bot, loading, error } = useBot(id);
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
    <main className="flex flex-col pt-32 items-center justify-center">
      {!loading && bot ? (
        <div className="w-1/2 bg-zinc-900 rounded-lg flex flex-col h-140">
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
      ) : loading ? (
        <div className="size-16 border-b-4 border-l-4 border-white rounded-full animate-spin"></div>
      ) : (
        <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-center">
          <p className="text-lg font-semibold">
            {error || "Bot not available."}
          </p>
          <p className="text-sm text-zinc-400 mt-2">
            The bot may have been removido or está temporariamente indisponível.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 bg-primary rounded-md text-white hover:opacity-80 transition"
          >
            Voltar
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
    </main>
  );
}
