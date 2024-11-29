"use client";

import { useState } from "react";
import ExcelViewer from "../components/ExcelViewer";
import FileUpload from "../components/FileUpload";
import ProgressBar from "../components/ProgressBar";
import type { SheetData } from "../types";

const UPLOAD_SECTION_WIDTH = "w-[600px]";

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
    <main className="min-h-screen flex flex-col items-center p-4 bg-white">
      <div className="w-full max-w-7xl space-y-8">
        {/* 서비스 헤더 섹션 추가 */}
        <div className="text-center space-y-4 py-8 border-b">
          <h1 className="text-3xl font-bold text-gray-900">
            Excel Line Separator Checker
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            엑셀 파일 내의 비정상적인 줄 종결자(Line Separator)를 검사하고
            수정하는 도구입니다. LS(Line Separator), PS(Paragraph Separator)
            등의 특수 문자를 감지하고 정상적인 줄바꿈으로 변환할 수 있습니다.
          </p>
        </div>

        {/* 파일 업로드 섹션 */}
        <div className="w-full flex flex-col items-center justify-center space-y-4 py-8">
          <div className={UPLOAD_SECTION_WIDTH}>
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
          </div>
          <div className={UPLOAD_SECTION_WIDTH}>
            <ProgressBar progress={progress} />
          </div>
        </div>

        {/* 데이터 표시 섹션 */}
        {sheets && sheets.length > 0 && (
          <div className="space-y-4 w-full">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">파일명:</span>
              <span className="text-sm text-gray-900">{fileName}</span>
            </div>
            <ExcelViewer sheets={sheets} />
          </div>
        )}
      </div>
    </main>
  );
}
