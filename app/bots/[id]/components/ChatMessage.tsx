import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatMessage({
  role,
  content,
}: {
  role: "user" | "bot";
  content: string;
}) {
  return (
    <div
      className={`p-4 my-2 rounded-lg mx-6 markdown w-fit max-w-[90%] ${
        role === "user"
          ? "bg-white ml-16 self-end"
          : "bg-zinc-800 text-white mr-16 self-start"
      }`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
