import { Bot } from "@/app/types";
import ChatBotCard from "./components/ChatBotCard";
import SkeletonCard from "./components/SkeletonCard";

export default function BotGroup({
  bots,
  loading,
  search,
}: {
  bots: Bot[];
  loading: boolean;
  search: string;
}) {
  return (
    <div className="flex flex-wrap mt-16 px-48 justify-center">
      {!loading && bots.length > 0 ? (
        bots
          .filter(
            (bot: Bot) =>
              bot.name.toLowerCase().includes(search.toLowerCase()) ||
              bot.description.toLowerCase().includes(search.toLowerCase()),
          )
          .map((bot: Bot) => <ChatBotCard key={bot.id} bot={bot} />)
      ) : !loading ? (
        <p className="text-zinc-500 mt-8">No bots found.</p>
      ) : (
        [1, 2, 3, 4].map((loader) => <SkeletonCard key={loader} />)
      )}
    </div>
  );
}
