"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Bot } from "./types";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [bots, setBots] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchBots() {
      const response = await fetch("/api/bots");
      const data = await response.json();
      setBots(data);
      setLoading(false);
    }

    fetchBots();
  }, []);
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Image src="/logo.png" alt="ForgeAI Logo" width={200} height={200} />
      <div className="flex flex-col md:flex-row gap-4 items-center mt-8">
        <input
          type="text"
          placeholder="Search bots..."
          className="h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 w-80 text-white placeholder:text-zinc-600 focus:border-primary outline-none transition"
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link
          href="/create"
          className="bg-primary text-white font-medium flex items-center px-5 h-10 rounded-lg transition hover:opacity-80"
        >
          Create
        </Link>
      </div>
      <div className="flex flex-wrap mt-16 px-48 justify-center">
        {!loading && bots.length > 0 ? (
          bots
            .filter(
              (bot: Bot) =>
                bot.name.toLowerCase().includes(search.toLowerCase()) ||
                bot.description.toLowerCase().includes(search.toLowerCase()),
            )
            .map((bot: Bot) => (
              <Link
                key={bot.id}
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
                  <h2 className="text-2xl text-primary font-semibold mb-2">
                    {bot.name}
                  </h2>
                  <p className="text-zinc-300">{bot.description}</p>
                </div>
              </Link>
            ))
        ) : !loading ? (
          <p className="text-zinc-500 mt-8">No bots found.</p>
        ) : (
          [1, 2, 3, 4].map((loader) => (
            <div
              key={loader}
              className="animate-pulse flex gap-4 rounded-lg m-2 w-96 bg-zinc-900"
            >
              <div className="bg-zinc-800 size-24 rounded-l-lg" />
              <div className="p-3 flex-1">
                <div className="h-6 bg-zinc-800 rounded w-1/2 mb-2" />
                <div className="h-4 bg-zinc-800 rounded w-full mb-1" />
                <div className="h-4 bg-zinc-800 rounded w-full mb-1" />
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
