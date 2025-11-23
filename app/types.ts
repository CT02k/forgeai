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

export type ChatRole = "user" | "bot";

export interface ChatMessage {
  id?: string;
  role: ChatRole;
  content: string;
  createdAt?: string | Date;
}

export interface ChatSessionSummary {
  id: string;
  bot: {
    id: string;
    name: string;
    avatar: string;
  };
  lastMessage?: string;
  updatedAt: string;
}
