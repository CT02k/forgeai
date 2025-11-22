import type { Role } from "@/app/types";

export type SessionData = {
  id: string;
  username: string;
  role: Role;
  isBanned: boolean;
  createdAt: Date;
};
