export default function ChatInput({
  loadingMessage,
  onSendMessage,
}: {
  loadingMessage: boolean;
  onSendMessage: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="h-14 bg-zinc-800 rounded-b-lg">
      <input
        type="text"
        disabled={loadingMessage}
        className={`w-full h-full p-4 outline-none rounded-lg placeholder:text-zinc-500 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-pulse`}
        placeholder="Type your message..."
        onKeyDown={onSendMessage}
      />
    </div>
  );
}
