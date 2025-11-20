"use client";
import { useState, DragEvent } from "react";
import { Upload, Loader2 } from "lucide-react";
import axios from "axios";

export default function UploadAvatar({
  onChange,
}: {
  onChange: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  async function uploadFile(file: File) {
    setLoading(true);

    const fd = new FormData();
    fd.append("file", file);

    const res = await axios.post("/api/upload", fd);

    const data = await res.data;
    setLoading(false);
    setIsDragging(false);

    if (data?.url) {
      setInputValue(data.url);
      onChange(data.url);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <input
          type="url"
          placeholder="Paste or upload avatar URL"
          className="border border-zinc-700 bg-zinc-800 rounded-lg px-3 py-2 placeholder:text-zinc-500 outline-none transition focus:border-primary"
          value={inputValue}
          onChange={(e) => {
            const url = e.target.value;
            setInputValue(url);
            onChange(url);
          }}
        />
      </div>

      <div
        className={`
          border-2 border-dashed rounded-xl p-6 transition cursor-pointer
          ${loading ? "opacity-50" : ""}
          ${isDragging ? "border-yellow-500 bg-zinc-800/50" : "border-zinc-600 hover:border-primary"}
        `}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <label className="flex flex-col items-center gap-3 text-center cursor-pointer">
          {loading ? (
            <Loader2 className="size-6 animate-spin text-zinc-400" />
          ) : (
            <Upload
              className={`size-6 transition ${
                isDragging ? "text-yellow-400" : "text-zinc-400"
              }`}
            />
          )}

          <span className="text-sm text-zinc-400">
            Drag an image here or click to upload
          </span>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </label>
      </div>
    </div>
  );
}
