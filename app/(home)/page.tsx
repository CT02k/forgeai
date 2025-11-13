"use client";
import Image from "next/image";
import useBots from "./hooks/useBots";
import SearchInput from "./SearchInput";
import BotGroup from "./BotGroup";

export default function Home() {
  const { bots, loading, search, setSearch } = useBots();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Image src="/logo.png" alt="ForgeAI Logo" width={200} height={200} />
      <SearchInput search={search} setSearch={setSearch} />
      <BotGroup bots={bots} loading={loading} search={search} />
    </main>
  );
}
