import { Bot } from "@/app/types";
import axios from "axios";
import { useState, useEffect } from "react";

export default function useBot(id: string) {
  const [loading, setLoading] = useState(true);
  const [bot, setBot] = useState<Bot>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBot() {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/bots/${id}`);
        const data = await response.data;
        setBot(data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message =
            (err.response?.data as { error?: string })?.error ||
            "Bot unavailable.";
          setError(message);
        } else {
          setError("Bot unavailable.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchBot();
  }, [id]);

  return { bot, loading, error };
}
