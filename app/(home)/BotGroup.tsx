import { Bot } from "../types";
import ChatBotCard from "./components/ChatBotCard";
import SkeletonCard from "./components/SkeletonCard";

export default function BotGroup({
  bots,
  loading,
  search,
  sortOrder,
}: {
  bots: Bot[];
  loading: boolean;
  search: string;
  sortOrder: "recent" | "oldest";
}) {
  if (loading) {
    return (
      <div className="flex flex-wrap mt-16 px-48 justify-center">
        {[1, 2, 3, 4].map((loader) => (
          <SkeletonCard key={loader} />
        ))}
      </div>
    );
  }

  if (!loading && bots.length === 0) {
    return <p className="text-zinc-500 mt-8">No bots found.</p>;
  }

  const sortedBots = [...bots].sort((a, b) => {
    const aDate = new Date(a.createdAt!).getTime();
    const bDate = new Date(b.createdAt!).getTime();

    if (sortOrder === "recent") return bDate - aDate;
    if (sortOrder === "oldest") return aDate - bDate;

    return 0;
  });

  const filteredBots = sortedBots.filter((bot) =>
    bot.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-wrap mt-16 px-48 justify-center">
      {filteredBots.map((bot) => (
        <ChatBotCard key={bot.id} bot={bot} />
      ))}
    </div>
  );
}
