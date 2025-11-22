import Link from "next/link";

interface SearchInputProps {
  search: string;
  setSearch: (value: string) => void;
  sortOrder: "recent" | "oldest";
  setSortOrder: (value: "recent" | "oldest") => void;
}

export default function SearchInput({
  search,
  setSearch,
  sortOrder,
  setSortOrder,
}: SearchInputProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center mt-8">
      <input
        type="text"
        placeholder="Search bots..."
        value={search}
        className="h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 w-80 text-white placeholder:text-zinc-600 focus:border-primary outline-none transition"
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value as "recent" | "oldest")}
        className="h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
      >
        <option value="recent">Mais recentes</option>
        <option value="oldest">Mais antigos</option>
      </select>

      <Link
        href="/create"
        className="bg-primary text-white font-medium flex items-center px-5 h-10 rounded-lg transition hover:opacity-80"
      >
        Create
      </Link>
    </div>
  );
}
