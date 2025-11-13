import { useState, useEffect } from "react";

export default function TypingIndicator() {
  const [loading, setLoading] = useState(true);
  const [bots, setBots] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchBots() {
      const response = await fetch("/api/bots");
      const data = await response.json();
      setBots(data);
      setLoading(false);
    }

    fetchBots();
  }, []);

  return { bots, loading, search, setSearch };
}
