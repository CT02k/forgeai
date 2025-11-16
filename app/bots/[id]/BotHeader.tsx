import { Bot } from "@/app/types";
import Image from "next/image";

export default function BotHeader({
  bot,
  onClearChat,
  canClear,
}: {
  bot: Bot;
  onClearChat: () => void;
  canClear: boolean;
}) {
  return (
    <div className="flex rounded-t-lg bg-zinc-800 p-3 items-center gap-5">
      <div className="flex items-center gap-5 flex-1">
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
      <button
        type="button"
        onClick={onClearChat}
        disabled={!canClear}
        className="px-4 py-2 text-sm font-semibold text-white bg-red-600/80 hover:bg-red-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Clean
      </button>
    </div>
  );
}
