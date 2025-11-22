import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function useBots() {
  const [loading, setLoading] = useState(true);
  const [bots, setBots] = useState([]);
  const [search, setSearch] = useState("");

  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");

  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const querySearch = params.get("search") || "";

    async function fetchBots() {
      const response = await axios.get("/api/bots");
      setBots(response.data);
      setSearch(querySearch);
      setLoading(false);
    }

    fetchBots();
  }, []);

  useEffect(() => {
    router.replace(
      search.trim() === "" ? "/" : `/?search=${encodeURIComponent(search)}`,
    );
  }, [search, router]);

  return { bots, loading, search, setSearch, sortOrder, setSortOrder };
}
