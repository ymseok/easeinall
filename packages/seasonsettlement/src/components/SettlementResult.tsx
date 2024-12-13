"use client";

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
    // TODO: 엑셀 다운로드 로직 구현
    console.log("Downloading settlement data:", data);
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
        {/* TODO: 정산 결과 표시 로직 구현 */}
      </div>
    </div>
  );
}
