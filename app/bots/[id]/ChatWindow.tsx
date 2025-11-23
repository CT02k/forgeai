import ChatMessage from "./components/ChatMessage";
import TypingIndicator from "./components/TypingIndicator";

export default function ChatWindow({
  messages,
  loadingMessage,
  loadingHistory,
}: {
  messages: { role: "user" | "bot"; content: string }[];
  loadingMessage: boolean;
  loadingHistory?: boolean;
}) {
  return (
    <div
      className="flex flex-col grow overflow-y-auto overflow-x-hidden py-4 scroll-smooth"
      id="chat-container"
    >
      {loadingHistory ? (
        <div className="text-center text-zinc-400 py-6 text-sm">
          Loading history...
        </div>
      ) : messages.length > 0 ? (
        messages.map((message, index) => (
          <ChatMessage {...message} key={index} />
        ))
      ) : (
        <div className="text-center text-zinc-500 py-6 text-sm">
          No messages yet. Send something to start the conversation.
        </div>
      )}
      {loadingMessage && <TypingIndicator />}
    </div>
  );
}
