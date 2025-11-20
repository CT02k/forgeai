import { Bot } from "@/app/types";
import axios from "axios";
import { useState, useEffect } from "react";

export default function useBot(id: string) {
  const [loading, setLoading] = useState(true);
  const [bot, setBot] = useState<Bot>();

  useEffect(() => {
    async function fetchBot() {
      const response = await axios.get(`/api/bots/${id}`);
      const data = await response.data;
      setBot(data);
      setLoading(false);
    }

    fetchBot();
  }, [id]);

  return { bot, loading };
}
