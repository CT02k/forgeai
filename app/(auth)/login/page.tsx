"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    axios
      .get("/api/auth", {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((v) => {
        if (v.status === 200) {
          router.push("/");
        }
      });
  }, [router]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    axios
      .post("/api/auth/login", { username, password })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Login failed");
        }
        return res.data;
      })
      .then(() => {
        router.push("/");
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(error.message);
      });
  }
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 w-72 md:w-96 h-fit p-8">
        <h1 className="text-4xl font-semibold text-white">Welcome Back!</h1>
        <form onSubmit={handleSubmit}>
          <label className="flex flex-col mt-8 text-white mb-1.5 text-lg">
            Username
          </label>
          <input
            required
            type="text"
            name="username"
            id="username"
            placeholder="PotatoPlays999"
            className="border border-zinc-700 bg-zinc-800 rounded-lg px-2 py-2.5 placeholder:text-zinc-500 text-white outline-none focus:border-primary transition w-full"
          />
          <label className="flex flex-col mt-4 text-white mb-1.5 text-lg">
            Password
          </label>
          <input
            required
            type="password"
            name="password"
            id="password"
            placeholder="SuperSecret123!"
            className="border border-zinc-700 bg-zinc-800 rounded-lg px-2 py-2.5 placeholder:text-zinc-500 text-white outline-none focus:border-primary transition w-full"
          />
          <input
            type="submit"
            value="Login"
            className="mt-6 bg-primary text-white rounded-lg px-4 py-2 hover:opacity-80 cursor-pointer w-full transition"
          />
          <p className="text-white mt-2">
            Don{"'"}t have a account?
            <Link href="/register" className="text-primary underline ml-1">
              Register.
            </Link>
          </p>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </main>
  );
}
