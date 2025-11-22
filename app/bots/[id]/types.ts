export type ChatAttachment = {
  url: string;
  name: string;
  mimeType?: string;
};

export type ChatMessage = {
  role: "user" | "bot";
  content: string;
  attachments?: ChatAttachment[];
};
