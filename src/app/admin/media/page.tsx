"use client";

import { useState, useRef } from "react";

interface MediaFile {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(fileList: FileList) {
    setUploading(true);

    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          setFiles((prev) => [data, ...prev]);
        }
      } catch {
        // skip failed uploads
      }
    }

    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>

      {/* Upload Area */}
      <div
        className={`mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <svg
          className="mb-4 h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"
          />
        </svg>
        <p className="text-sm text-gray-600">
          Drag & drop files here, or{" "}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            browse
          </button>
        </p>
        <p className="mt-1 text-xs text-gray-400">
          JPEG, PNG, GIF, WebP, SVG up to 5MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleUpload(e.target.files);
          }}
        />
      </div>

      {uploading && (
        <p className="mt-4 text-center text-sm text-gray-500">Uploading...</p>
      )}

      {/* Uploaded Files Grid */}
      {files.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800">
            Uploaded ({files.length})
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {files.map((file) => (
              <div
                key={file.filename}
                className="group overflow-hidden rounded-xl bg-white shadow-sm"
              >
                <div className="relative aspect-square bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-gray-700">
                    {file.filename}
                  </p>
                  <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                  <button
                    onClick={() => copyUrl(file.url)}
                    className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length === 0 && !uploading && (
        <p className="mt-12 text-center text-gray-400">
          No files uploaded yet. Upload images to use in your posts.
        </p>
      )}
    </div>
  );
}
