import { SessionData } from "./types/session";

import axios from "axios";

export async function getSession(): Promise<SessionData> {
  const res = await axios.get("/api/auth");

  const data = res.status !== 200 ? false : res.data;

  return data;
}
