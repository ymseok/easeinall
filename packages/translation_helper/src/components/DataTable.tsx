"use client";

import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import type { DataTableProps } from "../types";
import { checkLineSeparators } from "../utils/textValidation";

export default function DataTable({ data, sheetName }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [invalidCells, setInvalidCells] = useState<
    Map<string, Array<{ char: string; position: number; name: string }>>
  >(new Map());
  const processCompleteRef = useRef(false);
  const [detectionSummary, setDetectionSummary] = useState<{
    totalCells: number;
    totalIssues: number;
    issuesSummary: string;
  } | null>(null);
  const [invalidRows, setInvalidRows] = useState(new Set<number>());
  const [showIssueList, setShowIssueList] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const rowsPerPageOptions = [10, 30, 50];

  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];
  const tableData =
    data && data.length > 0 ? (data.length === 1 ? data : data.slice(1)) : [];

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = tableData.slice(startIndex, endIndex);

  const getInvalidRowsInfo = () => {
    const invalidRowsInfo: { rowIndex: number; firstColumn: string }[] = [];
    Array.from(invalidRows).forEach((rowIndex) => {
      const row = tableData[rowIndex];
      if (row) {
        const firstColumnKey = Object.keys(row)[0];
        invalidRowsInfo.push({
          rowIndex: rowIndex + 1, // 1-based index for display
          firstColumn: String(row[firstColumnKey]),
        });
      }
    });
    return invalidRowsInfo;
  };

  const handleItemsPerPageChange = (newValue: number) => {
    setItemsPerPage(newValue);
    setCurrentPage(1);
  };

  useEffect(() => {
    processCompleteRef.current = false;
    const newInvalidCells = new Map();
    const issuesByType = new Map<string, number>();
    const newInvalidRows = new Set<number>();

    if (tableData.length > 0) {
      tableData.forEach((row, rowIndex) => {
        let rowHasIssue = false;

        Object.entries(row).forEach(([key, value]) => {
          if (typeof value === "string") {
            const { hasInvalidSeparators, details } =
              checkLineSeparators(value);
            if (hasInvalidSeparators) {
              const cellKey = `${rowIndex}-${key}`;
              newInvalidCells.set(cellKey, details);
              rowHasIssue = true;

              details.forEach(({ name }) => {
                issuesByType.set(name, (issuesByType.get(name) || 0) + 1);
              });
            }
          }
        });

        if (rowHasIssue) {
          newInvalidRows.add(rowIndex);
        }
      });

      if (newInvalidRows.size > 0 && !processCompleteRef.current) {
        processCompleteRef.current = true;

        const issuesSummary = Array.from(issuesByType.entries())
          .map(([type, count]) => `${type}: ${count}개`)
          .join(", ");

        setDetectionSummary({
          totalCells: newInvalidCells.size,
          totalIssues: newInvalidRows.size,
          issuesSummary,
        });
      } else {
        setDetectionSummary(null);
      }
    }

    setInvalidCells(newInvalidCells);
    setInvalidRows(newInvalidRows);
  }, [data]);

  useEffect(() => {
    const tableContainer = document.querySelector(".overflow-x-auto");
    if (tableContainer) {
      tableContainer.scrollTop = 0;
    }
  }, [currentPage]);

  const handleDownloadCleaned = () => {
    try {
      // 데이터 정제
      const cleanedData = tableData.map((row) => {
        const cleanedRow = { ...row };
        Object.entries(row).forEach(([key, value]) => {
          if (typeof value === "string") {
            // 비정상적인 줄 종결자 제거
            cleanedRow[key] = value
              .replace(/[\u2028\u2029]/g, "\n") // LS, PS를 일반 줄바꿈으로 변경
              .replace(/\r\n/g, "\n") // CRLF를 LF로 통일
              .replace(/\r/g, "\n"); // CR을 LF로 통일
          }
        });
        return cleanedRow;
      });

      // 메타 정보 행 생성
      const metaRow1 = Object.fromEntries(
        headers.map((h) => [h, "수정된 파일"])
      );

      const metaRow2 = Object.fromEntries(
        headers.map((h) => [
          h,
          "해당 파일은 시스템에 의해서 생성된 정보입니다.",
        ])
      );

      // 헤더를 포함한 전체 데이터 생성
      const fullData = [
        metaRow1,
        metaRow2,
        Object.fromEntries(headers.map((h) => [h, h])),
        ...cleanedData,
      ];

      // 엑셀 워크북 생성
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(fullData, { skipHeader: true });
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // 파일 다운로드
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      XLSX.writeFile(wb, `cleaned_data_${timestamp}.xlsx`);
    } catch (error) {
      console.error("Failed to download cleaned file:", error);
      alert("파일 다운로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full space-y-4">
      {detectionSummary && (
        <div
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md relative"
          style={{ borderLeftColor: "#f59e0b" }}
        >
          <div className="flex justify-between items-start">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  검사 결과 알림
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p className="inline-block">
                    총{" "}
                    <button
                      onClick={() => setShowIssueList(true)}
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      {detectionSummary.totalIssues}개
                    </button>
                    의 행에서 비정상적인 줄 종결자가 발견되었습니다.
                  </p>
                  <p className="mt-1">
                    발견된 문제: {detectionSummary.issuesSummary}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadCleaned}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              수정된 파일 다운로드
            </button>
          </div>

          {showIssueList && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    비정상적인 줄 종결자가 발견된 행
                  </h3>
                  <button
                    onClick={() => setShowIssueList(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2">
                  {getInvalidRowsInfo().map(({ rowIndex, firstColumn }) => (
                    <div
                      key={rowIndex}
                      className="p-2 bg-gray-50 rounded flex items-center"
                    >
                      <span className="font-medium mr-2">행 {rowIndex}:</span>
                      <span className="text-gray-700">{firstColumn}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">페이지당 행:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr className="border-b shadow-sm">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-100"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row, rowIndex) => {
              const actualRowIndex = startIndex + rowIndex;
              const isInvalidRow = invalidRows.has(actualRowIndex);

              return (
                <tr
                  key={rowIndex}
                  className={`${
                    isInvalidRow ? "bg-red-50" : ""
                  } hover:bg-gray-50`}
                >
                  {Object.values(row).map((value, colIndex) => {
                    const cellKey = `${actualRowIndex}-${colIndex}`;
                    const details = invalidCells.get(cellKey);

                    return (
                      <td
                        key={cellKey}
                        className={`px-6 py-4 text-sm relative ${
                          details
                            ? "bg-red-100 group cursor-pointer"
                            : isInvalidRow
                            ? "text-red-700"
                            : "text-gray-500"
                        }`}
                      >
                        {details ? (
                          <div className="relative group">
                            <div
                              className="text-red-700 font-medium break-words"
                              dangerouslySetInnerHTML={{
                                __html: checkLineSeparators(
                                  String(value)
                                ).markedText.replace(
                                  /\[(?:LS|PS)\]/g,
                                  (match) =>
                                    `<span class="inline-block bg-red-200 px-2 py-1 mx-1 rounded text-red-800 font-bold">${match}</span>`
                                ),
                              }}
                            />
                            <div className="absolute hidden group-hover:block bg-black text-white p-2 rounded text-xs -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10 shadow-lg">
                              <span className="font-medium">발견된 문제:</span>{" "}
                              {details
                                .map((d) => `${d.name} (위치: ${d.position})`)
                                .join(", ")}
                            </div>
                          </div>
                        ) : (
                          <span className="break-words">{String(value)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-500">
            총 {tableData.length}개 중 {startIndex + 1}-
            {Math.min(endIndex, tableData.length)}
          </div>
        </div>
      )}
    </div>
  );
}
