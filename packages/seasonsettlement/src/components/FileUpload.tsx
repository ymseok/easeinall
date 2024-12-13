"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { ExcelData } from "../types";

interface FileUploadProps {
  onUpload: (data: ExcelData) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<
        string,
        string | number
      >[];

      if (jsonData.length === 0) {
        throw new Error("빈 파일입니다.");
      }

      const headers = Object.keys(jsonData[0]);
      onUpload({ headers, data: jsonData });
    } catch (error) {
      console.error("File processing error:", error);
      alert("파일 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <input
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        id="fileInput"
      />
      <label
        htmlFor="fileInput"
        className="cursor-pointer text-gray-600 hover:text-gray-800"
      >
        <div className="space-y-2">
          <div className="text-4xl">📄</div>
          <div>클릭하거나 파일을 드래그하여 업로드하세요</div>
          <div className="text-sm text-gray-500">지원 형식: .xlsx, .xls</div>
        </div>
      </label>
    </div>
  );
}
