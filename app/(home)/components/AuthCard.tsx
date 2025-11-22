"use client";

import { getSession } from "@/app/lib/session";
import { SessionData } from "@/app/lib/types/session";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AuthCard() {
  const [user, setUser] = useState<SessionData>();

  useEffect(() => {
    async function getData() {
      const data = await getSession();
      setUser(data);
    }

    getData();
  }, []);

  if (!user) {
    return (
      <div className="flex gap-2 m-5">
        <Link
          className="flex items-center py-2 px-6 rounded-full bg-zinc-800 text-white cursor-pointer transition hover:opacity-80"
          href="/login"
        >
          Create Account
        </Link>
        <Link
          className="flex items-center py-2 px-6 rounded-full bg-primary text-white cursor-pointer transition hover:opacity-80"
          href="/login"
        >
          Login
        </Link>
      </div>
    );
  } else {
    return (
      <Link
        className="flex items-center p-2 gap-2 rounded-full bg-zinc-900 border border-zinc-800 w-40 m-5 cursor-pointer transition hover:opacity-80"
        href="/"
      >
        <div className="size-10">
          <Image
            src={`/api/avatars/${user.username}/64`}
            className="size-10 rounded-full bg-zinc-900"
            alt={`${user.username}'s avatar`}
            height={64}
            width={64}
          />
        </div>
        <div className="flex flex-col uppercase">
          <h1 className="text-base text-white font-semibold">
            {user.username}
          </h1>
          <p className="text-zinc-300 text-xs">{user.role}</p>
        </div>
      </Link>
    );
  }
}
