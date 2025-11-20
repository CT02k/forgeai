"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot } from "../types";
import Image from "next/image";
import { Trash } from "lucide-react";
import Link from "next/link";
import UploadAvatar from "./components/UploadAvatar";

export default function CreateBotPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");

  const router = useRouter();

  async function loadBots() {
    const res = await fetch("/api/auth");
    const data = await res.json();
    setBots(data.user.chatBots || []);
  }

  async function createBot({
    avatar,
    name,
    description,
    prompt,
  }: Omit<Bot, "id">) {
    await fetch("/api/bots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar, name, description, prompt }),
    });
    loadBots();
  }

  async function deleteBot(id: string) {
    await fetch(`/api/bots/${id}`, { method: "DELETE" });
    loadBots();
  }

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth");

      if (res.status !== 200) {
        router.push("/login");
        return false;
      }
      return true;
    }

    async function loadData() {
      const ok = await checkAuth();
      if (ok) {
        await loadBots();
      }
    }

    loadData();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center bg-zinc-950 text-white">
      <aside className="w-72 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col items-center gap-4 fixed left-0 top-0 h-full shadow-xl">
        <Image src="/logo.png" alt="Logo" width={150} height={150} />

        <div className="flex flex-col gap-3 overflow-y-auto pr-2 w-full">
          {bots.map((b) => (
            <Link
              key={b.id}
              href={`/bots/${b.id}`}
              className="flex items-center justify-between bg-zinc-800 px-3 py-2 rounded-lg w-full"
            >
              <span className="truncate">{b.name}</span>

              <button
                className="text-white rounded-md hover:opacity-80 transition cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  deleteBot(b.id);
                }}
              >
                <Trash size={16} />
              </button>
            </Link>
          ))}
        </div>
      </aside>

      <section className="flex-1 ml-64 p-10">
        <div className="max-w-xl mx-auto bg-zinc-900 p-6 rounded-xl shadow-xl">
          <h1 className="text-3xl font-semibold text-center mb-6">
            Create New Bot
          </h1>

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);

              const avatar = formData.get("avatar") as string | null;
              const name = formData.get("name") as string | null;
              const description = formData.get("description") as string | null;
              const prompt = formData.get("prompt") as string | null;

              if (!name || !description || !prompt) {
                console.error("Todos os campos são obrigatórios.");
                return;
              }

              createBot({
                avatar: String(avatar || "/default.png"),
                name: String(name),
                description: String(description),
                prompt: String(prompt),
              });

              form.reset();
            }}
          >
            <UploadAvatar onChange={setAvatarUrl} />

            <input type="hidden" name="avatar" value={avatarUrl} />

            <input
              required
              className="border border-zinc-700 bg-zinc-800 rounded-lg px-3 py-2 placeholder:text-zinc-500 outline-none transition focus:border-primary"
              type="text"
              name="name"
              placeholder="Bot Name"
            />

            <textarea
              required
              className="border border-zinc-700 bg-zinc-800 rounded-lg px-3 py-2 placeholder:text-zinc-500 outline-none transition focus:border-primary"
              name="description"
              placeholder="Description"
            />

            <textarea
              required
              className="border border-zinc-700 bg-zinc-800 rounded-lg px-3 py-2 placeholder:text-zinc-500 outline-none transition focus:border-primary"
              name="prompt"
              placeholder="Prompt"
            />

            <button
              type="submit"
              className="mt-6 bg-primary text-white rounded-lg px-4 py-2 hover:opacity-80 cursor-pointer w-full transition"
            >
              Create
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
