"use client";

import { useState } from "react";
import ExcelViewer from "../components/ExcelViewer";
import FileUpload from "../components/FileUpload";
import ProgressBar from "../components/ProgressBar";
import type { SheetData } from "../types";

export default function Home() {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (newSheets: SheetData[], name: string) => {
    try {
      setIsLoading(true);
      setProgress(0);

      // 프로그레스 시뮬레이션
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      setSheets(newSheets);
      setFileName(name);

      // 업로드 완료
      clearInterval(interval);
      setProgress(100);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <main className="container mx-auto p-4 space-y-8">
      <div className="space-y-4">
        <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
        <ProgressBar progress={progress} />
      </div>

      {sheets && sheets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-500">파일명:</span>
            <span className="text-sm text-gray-900">{fileName}</span>
          </div>
          <ExcelViewer sheets={sheets} />
        </div>
      )}
    </main>
  );
}
