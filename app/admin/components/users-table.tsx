import { LoadingSpinner } from "./loading-spinner";
import { formatDate } from "../utils";
import type { AdminUser } from "../types";

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  actionKey: string | null;
  onToggleBan: (user: AdminUser) => Promise<void>;
  onDelete: (user: AdminUser) => Promise<void>;
}

export function UsersTable({
  users,
  isLoading,
  actionKey,
  onToggleBan,
  onDelete,
}: UsersTableProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Users</h2>
        <span className="text-sm text-zinc-400">{users.length} found</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner />
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
                        onClick={() => onToggleBan(user)}
                        disabled={actionKey === `user-ban-${user.id}`}
                        className="px-3 py-1 rounded-md border border-zinc-700 text-xs hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {user.isBanned ? "Unban" : "Ban"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(user)}
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
  );
}
