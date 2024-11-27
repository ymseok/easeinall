import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import type { ExcelRow, SheetData, UploadResponse } from "../../../types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" } as UploadResponse,
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);

    // 모든 시트 처리
    const sheets: SheetData[] = workbook.SheetNames.map((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      }) as any[];

      // 첫 2줄은 설명이므로 건너뛰고, 3번째 줄을 헤더로 사용
      const headers = rawData[2] || []; // 3번째 줄을 헤더로
      const dataRows = rawData.slice(3); // 4번째 줄부터 데이터

      // 데이터를 객체 배열로 변환
      const processedData = dataRows.map((row) => {
        const rowData: ExcelRow = {};
        headers.forEach((header: string, index: number) => {
          if (header) {
            // 빈 헤더는 제외
            rowData[header] = row[index] || ""; // undefined인 경우 빈 문자열로
          }
        });
        return rowData;
      });

      return {
        name: sheetName,
        data: processedData.filter((row) => Object.keys(row).length > 0), // 빈 행 제거
      };
    });

    return NextResponse.json({ sheets } as UploadResponse);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file" } as UploadResponse,
      { status: 500 }
    );
  }
}
