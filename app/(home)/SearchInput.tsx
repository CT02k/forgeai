import Link from "next/link";

export default function SearchInput({
  setSearch,
}: {
  setSearch: (value: string) => void;
}) {
  return (
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
  );
}
