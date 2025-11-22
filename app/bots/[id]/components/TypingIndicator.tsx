export default function TypingIndicator() {
  return (
    <div className="p-4 my-2 rounded-lg mx-3 text-white mr-16 py-5.5 animate-pulse flex gap-2">
      <div className="size-3 bg-white rounded-full animate-bounce"></div>
      <div
        className="size-3 bg-white rounded-full animate-bounce"
        style={{ animationDelay: "0.15s" }}
      ></div>
      <div
        className="size-3 bg-white rounded-full animate-bounce"
        style={{ animationDelay: "0.3s" }}
      ></div>
    </div>
  );
}
