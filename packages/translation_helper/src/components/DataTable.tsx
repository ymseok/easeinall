"use client";

import { useEffect, useRef, useState } from "react";
import type { DataTableProps } from "../types";
import { checkLineSeparators } from "../utils/textValidation";

export default function DataTable({ data, itemsPerPage = 10 }: DataTableProps) {
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

  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];
  const tableData = data && data.length > 0 ? data.slice(1) : [];

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = tableData.slice(startIndex, endIndex);

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

  return (
    <div className="w-full space-y-4">
      {detectionSummary && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
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
                <p>
                  총 {detectionSummary.totalIssues}개의 행에서 비정상적인 줄
                  종결자가 발견되었습니다.
                </p>
                <p className="mt-1">
                  발견된 문제: {detectionSummary.issuesSummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto max-h-[600px] rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
