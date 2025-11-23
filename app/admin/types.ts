import type { Role } from "@/app/types";

export interface AdminUser {
  id: string;
  username: string;
  role: Role;
  isBanned: boolean;
  createdAt: string;
  botCount: number;
}

export interface AdminBot {
  id: string;
  name: string;
  avatar: string;
  description: string;
  createdAt: string;
  isBanned: boolean;
  createdBy: {
    id: string;
    username: string;
    isBanned?: boolean;
  };
}
