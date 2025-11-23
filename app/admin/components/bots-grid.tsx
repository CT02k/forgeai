import Image from "next/image";

import { LoadingSpinner } from "./loading-spinner";
import { formatDate } from "../utils";
import type { AdminBot } from "../types";

interface BotsGridProps {
  bots: AdminBot[];
  isLoading: boolean;
  actionKey: string | null;
  onToggleBan: (bot: AdminBot) => Promise<void>;
  onDelete: (bot: AdminBot) => Promise<void>;
}

export function BotsGrid({
  bots,
  isLoading,
  actionKey,
  onToggleBan,
  onDelete,
}: BotsGridProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Bots</h2>
        <span className="text-sm text-zinc-400">{bots.length} bots</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : bots.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-6">Empty...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className="border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 bg-zinc-950/40"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={bot.avatar}
                  alt={bot.name}
                  width={48}
                  height={48}
                  className="rounded-full size-12 object-cover"
                />
                <div>
                  <p className="font-semibold">{bot.name}</p>
                  <p className="text-xs text-zinc-400">
                    by {bot.createdBy.username}
                  </p>
                </div>
              </div>
              <p className="text-sm text-zinc-300 max-h-20 overflow-hidden">
                {bot.description}
              </p>
              <p className="text-xs text-zinc-500">
                Created at {formatDate(bot.createdAt)}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-semibold ${
                    bot.isBanned ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {bot.isBanned ? "Bot Banned" : "Active"}
                </span>
                {bot.createdBy.isBanned && (
                  <span className="text-red-300">Owner Banned</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onToggleBan(bot)}
                  disabled={actionKey === `bot-ban-${bot.id}`}
                  className="flex-1 px-3 py-2 rounded-md border border-zinc-700 text-sm hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bot.isBanned ? "Unban" : "Ban"}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(bot)}
                  disabled={actionKey === `bot-delete-${bot.id}`}
                  className="flex-1 px-3 py-2 rounded-md border border-red-600 text-sm text-red-300 hover:bg-red-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
