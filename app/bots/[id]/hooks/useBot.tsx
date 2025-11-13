import { Bot } from "@/app/types";
import { useState, useEffect } from "react";

export default function useBot(id: string) {
  const [loading, setLoading] = useState(true);
  const [bot, setBot] = useState<Bot>();

  useEffect(() => {
    async function fetchBot() {
      const response = await fetch(`/api/bots/${id}`);
      const data = await response.json();
      setBot(data);
      setLoading(false);
    }

    fetchBot();
  }, [id]);

  return { bot, loading };
}
