import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function TypingIndicator() {
  const [loading, setLoading] = useState(true);
  const [bots, setBots] = useState([]);
  const [search, setSearch] = useState("");

  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const querySearch = params.get("search") || "";

    async function fetchBots() {
      const response = await fetch("/api/bots");
      const data = await response.json();
      setBots(data);
      setSearch(querySearch);
      setLoading(false);
    }

    fetchBots();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      router.replace("/");
      return;
    }

    router.replace(`/?search=${encodeURIComponent(search)}`);
  }, [search, router]);

  return { bots, loading, search, setSearch };
}
