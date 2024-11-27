"use client";

import { useEffect, useState } from "react";
import type { SheetData } from "../types";
import DataTable from "./DataTable";

interface ExcelViewerProps {
  sheets: SheetData[];
}

export default function ExcelViewer({ sheets }: ExcelViewerProps) {
  const [activeSheet, setActiveSheet] = useState<number | null>(null);

  // 컴포넌트가 마운트되거나 sheets가 변경될 때 첫 번째 시트를 선택
  useEffect(() => {
    if (sheets && sheets.length > 0) {
      setActiveSheet(0);
    }
  }, [sheets]);

  if (!sheets.length) return null;

  const currentSheet = activeSheet !== null ? sheets[activeSheet] : sheets[0];

  return (
    <div className="w-full space-y-4">
      {/* 시트 탭 */}
      <div className="flex space-x-1 border-b border-gray-200">
        {sheets.map((sheet, index) => (
          <button
            key={`sheet-${sheet.name}-${index}`}
            onClick={() => setActiveSheet(index)}
            className={`
              px-4 py-2 
              text-sm font-medium 
              rounded-t-lg 
              focus:outline-none
              transition-colors
              ${
                (activeSheet ?? 0) === index
                  ? "bg-white border border-gray-200 border-b-white text-blue-600"
                  : "bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            {sheet.name}
          </button>
        ))}
      </div>

      {/* 현재 선택된 시트의 데이터 테이블 */}
      <div className="bg-white rounded-lg shadow">
        {currentSheet && currentSheet.data && currentSheet.data.length > 0 ? (
          <DataTable data={currentSheet.data} sheetName={currentSheet.name} />
        ) : (
          <div className="p-4 text-center text-gray-500">
            데이터가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
