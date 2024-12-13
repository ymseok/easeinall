"use client";

import { useState } from "react";
import DataTable from "../components/DataTable";
import FileUpload from "../components/FileUpload";
import SeasonPriceForm from "../components/SeasonPriceForm";
import SettlementResult from "../components/SettlementResult";
import { ExcelData, SeasonPrice, SettlementData } from "../types/index";

export default function Home() {
  const [step, setStep] = useState<1 | 2>(1);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [seasonPrices, setSeasonPrices] = useState<SeasonPrice[]>([]);
  const [settlementData, setSettlementData] = useState<SettlementData[]>([]);

  const handleFileUpload = (data: ExcelData) => {
    setExcelData(data);
    // 시즌 정보 추출 및 초기 시즌 가격 상태 설정
    const seasons = extractSeasons(data);
    setSeasonPrices(
      seasons.map((season) => ({
        season,
        price: 0,
      }))
    );
  };

  const handlePriceSubmit = (prices: SeasonPrice[]) => {
    setSeasonPrices(prices);
  };

  const generateSettlementData = () => {
    // 정산 데이터 생성 로직
    const settlement = calculateSettlement(excelData!, seasonPrices);
    setSettlementData(settlement);
    setStep(2);
  };

  return (
    <main className="container mx-auto p-4 space-y-6">
      {step === 1 ? (
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">엑셀 파일 업로드</h2>
            <FileUpload onUpload={handleFileUpload} />
          </section>

          {excelData && (
            <>
              {seasonPrices.length > 0 && (
                <section className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-bold mb-4">MBX 시세</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <SeasonPriceForm
                      seasonPrices={seasonPrices}
                      onSubmit={handlePriceSubmit}
                    />
                  </div>
                </section>
              )}

              <section className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">업로드된 데이터</h2>
                <DataTable data={excelData.data} />
              </section>

              <div className="flex justify-end">
                <button
                  onClick={generateSettlementData}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                  disabled={!seasonPrices.every((sp) => sp.price > 0)}
                >
                  정산용 데이터 생성
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <SettlementResult data={settlementData} onBack={() => setStep(1)} />
      )}
    </main>
  );
}

function extractSeasons(data: ExcelData): number[] {
  const seasons = new Set<number>();
  const seasonPattern = /시즌(\d+)/;

  data.headers.forEach((header) => {
    const match = header.match(seasonPattern);
    if (match) {
      const seasonNumber = parseInt(match[1]);
      if (!isNaN(seasonNumber)) {
        seasons.add(seasonNumber);
      }
    }
  });

  return Array.from(seasons).sort((a, b) => a - b);
}

function calculateSettlement(
  data: ExcelData,
  seasonPrices: SeasonPrice[]
): SettlementData[] {
  return data.data.map((row) => {
    const seasonNumber = Number(row["시즌"]);
    const points = Number(row["포인트"]);
    const mbxPrice =
      seasonPrices.find((sp) => sp.season === seasonNumber)?.price || 0;

    return {
      seasonNumber,
      points,
      mbxPrice,
      calculatedValue: points * mbxPrice,
    };
  });
}
