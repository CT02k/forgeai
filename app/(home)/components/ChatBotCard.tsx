import { Bot } from "../../types";

import Link from "next/link";
import Image from "next/image";

export default function ChatBotCard({ bot }: { bot: Bot }) {
  return (
    <Link
      href={`/bots/${bot.id}`}
      className="flex gap-4 rounded-lg m-2 w-72 md:w-96 items-center p-3 bg-zinc-900 cursor-pointer hover:opacity-80 transition"
    >
      <Image
        src={bot.avatar}
        alt={`${bot.name} Avatar`}
        height={128}
        width={128}
        className="size-16 md:size-24 rounded-full"
      />
      <div>
        <h2 className="text-2xl text-primary font-semibold mb-2">{bot.name}</h2>
        <p className="text-zinc-300">{bot.description}</p>
      </div>
    </Link>
  );
}
