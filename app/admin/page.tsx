"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { BotsGrid } from "./components/bots-grid";
import { LoadingSpinner } from "./components/loading-spinner";
import { StatsCards } from "./components/stats-cards";
import { UsersTable } from "./components/users-table";
import type { AdminBot, AdminUser } from "./types";
import { getErrorMessage } from "./utils";
import type { Role } from "@/app/types";

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bots, setBots] = useState<AdminBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const loadOverview = useCallback(async (showSpinner = false) => {
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
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await axios.get("/api/auth");
        const user = (res.data as { user?: { role?: Role } })?.user;

        if (res.status !== 200 || user?.role !== "ADMIN") {
          window.location.href = "/";
          return;
        }

        setIsAuthorized(true);
        loadOverview(true);
      } catch {
        window.location.href = "/";
      }
    }

    checkAuth();
  }, [loadOverview]);

  const totalStats = useMemo(
    () => ({
      totalUsers: users.length,
      bannedUsers: users.filter((user) => user.isBanned).length,
      totalBots: bots.length,
      bannedBots: bots.filter((bot) => bot.isBanned).length,
    }),
    [users, bots],
  );

  const toggleUserBan = useCallback(async (user: AdminUser) => {
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
  }, [loadOverview]);

  const deleteUser = useCallback(async (user: AdminUser) => {
    try {
      setActionKey(`user-delete-${user.id}`);
      await axios.delete(`/api/admin/users/${user.id}`);
      await loadOverview();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionKey(null);
    }
  }, [loadOverview]);

  const toggleBotBan = useCallback(async (bot: AdminBot) => {
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
  }, [loadOverview]);

  const deleteBot = useCallback(async (bot: AdminBot) => {
    try {
      setActionKey(`bot-delete-${bot.id}`);
      await axios.delete(`/api/admin/bots/${bot.id}`);
      await loadOverview();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionKey(null);
    }
  }, [loadOverview]);

  const isActionInFlight = loading || actionKey !== null;

  return (
    <main className="min-h-full bg-zinc-950 text-white p-6 md:p-10">
      {!isAuthorized ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Admin Panel</h1>
            </div>
            <button
              type="button"
              onClick={() => loadOverview(true)}
              className={`self-start rounded-md text-sm font-semibold hover:opacity-80 transition ${isActionInFlight && "animate-spin"} cursor-pointer`}
            >
              <RefreshCw />
            </button>
          </header>

          <StatsCards {...totalStats} />

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <UsersTable
            users={users}
            isLoading={loading}
            actionKey={actionKey}
            onToggleBan={toggleUserBan}
            onDelete={deleteUser}
          />

          <BotsGrid
            bots={bots}
            isLoading={loading}
            actionKey={actionKey}
            onToggleBan={toggleBotBan}
            onDelete={deleteBot}
          />
        </div>
      )}
    </main>
  );
}
