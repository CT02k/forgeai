import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number;
  muted?: ReactNode;
}

interface StatsCardsProps {
  totalUsers: number;
  bannedUsers: number;
  totalBots: number;
  bannedBots: number;
}

function StatCard({ label, value, muted }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-sm text-zinc-400 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {muted}
    </div>
  );
}

export function StatsCards({
  totalUsers,
  bannedUsers,
  totalBots,
  bannedBots,
}: StatsCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <StatCard
        label="Users"
        value={totalUsers}
        muted={<p className="text-sm text-red-400">Banned: {bannedUsers}</p>}
      />
      <StatCard
        label="Bots"
        value={totalBots}
        muted={<p className="text-sm text-red-400">Banned: {bannedBots}</p>}
      />
    </section>
  );
}
