import ChatMessage from "./components/ChatMessage";
import TypingIndicator from "./components/TypingIndicator";

export default function ChatWindow({
  messages,
  loadingMessage,
}: {
  messages: { role: "user" | "bot"; content: string }[];
  loadingMessage: boolean;
}) {
  return (
    <div
      className="flex flex-col grow overflow-y-auto py-4 scroll-smooth"
      id="chat-container"
    >
      {messages.map((message, index) => (
        <ChatMessage {...message} key={index} />
      ))}
      {loadingMessage && <TypingIndicator />}
    </div>
  );
}
