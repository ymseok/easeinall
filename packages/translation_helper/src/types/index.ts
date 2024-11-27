"use strict";

export interface ExcelRow {
  [key: string]: string | number;
}

export interface ExcelData {
  [key: string]: string | number;
}

export interface UploadResponse {
  error?: string;
  sheets?: SheetData[];
}

export interface DataTableProps {
  data: ExcelRow[];
  itemsPerPage?: number;
}

// ProgressBar 컴포넌트를 위한 Props 타입 추가
export interface ProgressBarProps {
  progress: number;
}

export interface SheetData {
  name: string;
  data: ExcelRow[];
}
