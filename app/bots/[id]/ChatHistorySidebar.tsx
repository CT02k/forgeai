import Image from "next/image";
import Link from "next/link";

import { ChatSessionSummary } from "@/app/types";
import { Trash2 } from "lucide-react";

type Props = {
  sessions: ChatSessionSummary[];
  activeChatId?: string;
  currentBotId: string;
  loading?: boolean;
  onStartNewChat: () => void;
  onDeleteChat: (sessionId: string) => void;
};

export default function ChatHistorySidebar({
  sessions,
  activeChatId,
  currentBotId,
  loading,
  onStartNewChat,
  onDeleteChat,
}: Props) {
  return (
    <aside className="w-full md:w-80 bg-zinc-900 border border-zinc-800 rounded-lg h-[80vh] min-h-[520px] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-800 rounded-t-lg">
        <div className="flex flex-col">
          <p className="text-xs text-zinc-400">History</p>
          <h3 className="text-lg font-semibold text-white">Your chats</h3>
        </div>
        <button
          type="button"
          onClick={onStartNewChat}
          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-white hover:opacity-90 transition"
        >
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-16 rounded-md bg-zinc-800/60 animate-pulse"
              />
            ))
          : sessions.map((session) => (
              <Link
                key={session.id}
                href={`/bots/${session.bot.id}?chat=${session.id}`}
                className={`flex items-center gap-3 rounded-md border px-3 py-2 transition ${
                  session.id === activeChatId
                    ? "border-primary bg-primary/10"
                    : "border-transparent bg-zinc-800/40 hover:border-zinc-700"
                }`}
              >
                <Image
                  src={session.bot.avatar}
                  alt={`${session.bot.name} avatar`}
                  width={40}
                  height={40}
                  className="rounded-full object-cover bg-zinc-800"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white truncate">
                      {session.bot.name}
                    </p>
                    <span className="text-[11px] text-zinc-500">
                      {formatDate(session.updatedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate">
                    {session.lastMessage || "No messages yet"}
                  </p>
                  {session.bot.id !== currentBotId && (
                    <p className="text-[11px] text-amber-300">
                      Switch to this bot
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onDeleteChat(session.id);
                  }}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition"
                  aria-label="Delete chat"
                >
                  <Trash2 size={16} />
                </button>
              </Link>
            ))}

        {!loading && sessions.length === 0 && (
          <p className="text-center text-sm text-zinc-500 py-6">
            No saved chats yet. Send a message to get started.
          </p>
        )}
      </div>
    </aside>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
