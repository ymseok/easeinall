"use client";

import * as XLSX from "xlsx";
import { SettlementData } from "../types/index";

interface SettlementResultProps {
  data: SettlementData[];
  onBack: () => void;
}

export default function SettlementResult({
  data,
  onBack,
}: SettlementResultProps) {
  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "정산결과");
    XLSX.writeFile(wb, `정산결과_${new Date().toISOString()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
        >
          ← 돌아가기
        </button>
        <button
          onClick={handleDownload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          엑셀 다운로드
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">정산 결과</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  NO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  크리에이터ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  크리에이터명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  지갑주소
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  총 포인트
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  총 MBX
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  사전모집 MBX
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  인센티브 MBX
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  시즌 MBX
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  마지막 시즌
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr key={`${row.no || index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{row.no || "-"}</td>
                  <td className="px-6 py-4 text-sm">{row.creatorId || "-"}</td>
                  <td className="px-6 py-4 text-sm">
                    {row.creatorName || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">
                    {row.walletAddress || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {(row.totalPoints || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {(row.totalMbx || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-right relative group">
                    <div className="relative">
                      {(row.earlyBirdMbx || 0).toLocaleString()}
                      <div className="absolute hidden group-hover:block bg-black text-white p-2 rounded text-xs -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                        포인트: {(row.earlyBirdPoints || 0).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right relative group">
                    <div className="relative">
                      {(row.incentiveMbx || 0).toLocaleString()}
                      <div className="absolute hidden group-hover:block bg-black text-white p-2 rounded text-xs -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                        포인트: {(row.incentivePoints || 0).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right relative group">
                    <div className="relative">
                      {(row.seasonMbx || 0).toLocaleString()}
                      <div className="absolute hidden group-hover:block bg-black text-white p-2 rounded text-xs -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                        포인트: {(row.seasonPoints || 0).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    {row.lastUsedSeason || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
