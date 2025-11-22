export type Role = "USER" | "ADMIN";

export interface Bot {
  id: string;
  name: string;
  avatar: string;
  description: string;
  prompt: string;
  isBanned?: boolean;
  createdAt?: string;
  createdBy?: {
    id: string;
    username: string;
    isBanned?: boolean;
  };
}

export interface Token {
  id: string;
  username: string;
  role: Role;
}
