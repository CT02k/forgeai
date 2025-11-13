import { Bot } from "@/app/types";
import { useState, useEffect } from "react";
import useChat from "./useChat";

export default function useBot(id: string) {
  const [loading, setLoading] = useState(true);
  const [bot, setBot] = useState<Bot>();
  const { setMessages } = useChat(id);

  const storeKey = `chat_history_${id}`;

  useEffect(() => {
    async function fetchBot() {
      const response = await fetch(`/api/bots/${id}`);
      const data = await response.json();
      setBot(data);
      setLoading(false);
      const storedHistory = localStorage.getItem(storeKey);
      if (storedHistory) {
        setMessages(JSON.parse(storedHistory));
      }
    }

    fetchBot();
  }, [id, storeKey, setMessages]);

  return { bot, loading };
}
