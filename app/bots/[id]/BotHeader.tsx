import { Bot } from "@/app/types";
import Image from "next/image";

export default function BotHeader({ bot }: { bot: Bot }) {
  return (
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
  );
}
