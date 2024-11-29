"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import type { SheetData } from "../types";

interface FileUploadProps {
  onFileUpload: (sheets: SheetData[], fileName: string) => void;
  isLoading: boolean;
}

export default function FileUpload({
  onFileUpload,
  isLoading,
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      onFileUpload(result.sheets, file.name);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setError(
        error instanceof Error ? error.message : "파일 업로드에 실패했습니다."
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isLoading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        handleFile(file);
      } else {
        setError("XLSX 또는 XLS 파일만 업로드 가능합니다.");
      }
    }
  };

  return (
    <div className="w-full">
      <div
        className={`flex flex-col items-center justify-center w-full h-32 
          border-2 border-dashed rounded-lg cursor-pointer w-[600px]
          ${
            isLoading
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-gray-50 hover:bg-gray-100"
          }
          ${isDragging ? "border-blue-500 bg-blue-50" : ""}
          ${error ? "border-red-500" : "border-gray-300"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload
            className={`w-8 h-8 mb-2 ${
              error
                ? "text-red-500"
                : isDragging
                ? "text-blue-500"
                : "text-gray-500"
            }`}
          />
          <p
            className={`mb-2 text-sm ${
              error
                ? "text-red-500"
                : isDragging
                ? "text-blue-500"
                : "text-gray-500"
            }`}
          >
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500">XLSX, XLS</p>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
