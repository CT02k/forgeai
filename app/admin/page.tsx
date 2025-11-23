"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { Role } from "@/app/types";
import { RefreshCw } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  role: Role;
  isBanned: boolean;
  createdAt: string;
  botCount: number;
}

interface AdminBot {
  id: string;
  name: string;
  avatar: string;
  description: string;
  createdAt: string;
  isBanned: boolean;
  createdBy: {
    id: string;
    username: string;
    isBanned?: boolean;
  };
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseError = (error.response?.data as { error?: string })?.error;
    return responseError || error.message || "Error.";
  }

  return "Error.";
};

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bots, setBots] = useState<AdminBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadOverview(showSpinner = false) {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      const res = await axios.get("/api/admin/overview");
      setUsers(res.data.users || []);
      setBots(res.data.bots || []);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadOverview(true);
  }, []);

  const totalStats = useMemo(
    () => ({
      totalUsers: users.length,
      bannedUsers: users.filter((user) => user.isBanned).length,
      totalBots: bots.length,
      bannedBots: bots.filter((bot) => bot.isBanned).length,
    }),
    [users, bots],
  );

  async function toggleUserBan(user: AdminUser) {
    try {
      setActionKey(`user-ban-${user.id}`);
      await axios.patch(`/api/admin/users/${user.id}`, {
        isBanned: !user.isBanned,
      });
      await loadOverview();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionKey(null);
    }
  }

  async function deleteUser(user: AdminUser) {
    try {
      setActionKey(`user-delete-${user.id}`);
      await axios.delete(`/api/admin/users/${user.id}`);
      await loadOverview();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionKey(null);
    }
  }

  async function toggleBotBan(bot: AdminBot) {
    try {
      setActionKey(`bot-ban-${bot.id}`);
      await axios.patch(`/api/admin/bots/${bot.id}`, {
        isBanned: !bot.isBanned,
      });
      await loadOverview();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionKey(null);
    }
  }

  async function deleteBot(bot: AdminBot) {
    try {
      setActionKey(`bot-delete-${bot.id}`);
      await axios.delete(`/api/admin/bots/${bot.id}`);
      await loadOverview();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionKey(null);
    }
  }

  return (
    <main className="min-h-full bg-zinc-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Admin Panel</h1>
          </div>
          <button
            type="button"
            onClick={() => loadOverview(true)}
            className={`self-start rounded-md text-sm font-semibold hover:opacity-80 transition ${loading && "animate-spin"} cursor-pointer`}
          >
            <RefreshCw />
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400 uppercase tracking-wide">
              Users
            </p>
            <p className="text-3xl font-bold mt-2">{totalStats.totalUsers}</p>
            <p className="text-sm text-red-400">
              Banned: {totalStats.bannedUsers}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400 uppercase tracking-wide">
              Bots
            </p>
            <p className="text-3xl font-bold mt-2">{totalStats.totalBots}</p>
            <p className="text-sm text-red-400">
              Banned: {totalStats.bannedBots}
            </p>
          </div>
        </section>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Users</h2>
            <span className="text-sm text-zinc-400">{users.length} found</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="size-12 border-b-2 border-l-2 border-white rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-6">No users.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-zinc-400 font-semibold border-b border-zinc-800">
                    <th className="py-3">User</th>
                    <th className="py-3">Role</th>
                    <th className="py-3">Bots</th>
                    <th className="py-3">Created at</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-zinc-800/70 last:border-none"
                    >
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold">{user.username}</span>
                          <span
                            className={`text-xs ${
                              user.isBanned ? "text-red-400" : "text-green-400"
                            }`}
                          >
                            {user.isBanned ? "Banned" : "Active"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 uppercase text-xs">{user.role}</td>
                      <td className="py-3">{user.botCount}</td>
                      <td className="py-3">{formatDate(user.createdAt)}</td>
                      <td className="py-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => toggleUserBan(user)}
                            disabled={actionKey === `user-ban-${user.id}`}
                            className="px-3 py-1 rounded-md border border-zinc-700 text-xs hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {user.isBanned ? "Unban" : "Ban"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteUser(user)}
                            disabled={actionKey === `user-delete-${user.id}`}
                            className="px-3 py-1 rounded-md border border-red-600 text-xs text-red-300 hover:bg-red-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Bots</h2>
            <span className="text-sm text-zinc-400">{bots.length} bots</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="size-12 border-b-2 border-l-2 border-white rounded-full animate-spin"></div>
            </div>
          ) : bots.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-6">Empty...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  className="border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 bg-zinc-950/40"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={bot.avatar}
                      alt={bot.name}
                      width={48}
                      height={48}
                      className="rounded-full size-12 object-cover"
                    />
                    <div>
                      <p className="font-semibold">{bot.name}</p>
                      <p className="text-xs text-zinc-400">
                        by {bot.createdBy.username}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 max-h-20 overflow-hidden">
                    {bot.description}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Created at {formatDate(bot.createdAt)}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold ${
                        bot.isBanned ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {bot.isBanned ? "Bot Banned" : "Active"}
                    </span>
                    {bot.createdBy.isBanned && (
                      <span className="text-red-300">Owner Banned</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleBotBan(bot)}
                      disabled={actionKey === `bot-ban-${bot.id}`}
                      className="flex-1 px-3 py-2 rounded-md border border-zinc-700 text-sm hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bot.isBanned ? "Unban" : "Ban"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBot(bot)}
                      disabled={actionKey === `bot-delete-${bot.id}`}
                      className="flex-1 px-3 py-2 rounded-md border border-red-600 text-sm text-red-300 hover:bg-red-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
