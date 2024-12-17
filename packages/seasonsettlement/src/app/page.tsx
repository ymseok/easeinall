"use client";
import { useRef, useState } from "react";
import DataTable from "../components/DataTable";
import FileUpload from "../components/FileUpload";
import SeasonPriceForm, {
  SeasonPriceFormRef,
} from "../components/SeasonPriceForm";
import SettlementResult from "../components/SettlementResult";
import { ExcelData, SeasonPrice, SettlementData } from "../types/index";

export default function Home() {
  const [step, setStep] = useState<1 | 2>(1);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [seasonPrices, setSeasonPrices] = useState<SeasonPrice[]>([]);
  const [settlementData, setSettlementData] = useState<SettlementData[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const seasonPriceFormRef = useRef<SeasonPriceFormRef>(null);

  const handleFileUpload = (data: ExcelData) => {
    setExcelData(data);
    // 시즌 정보 추출 및 초기 시즌 가격 상태 설정
    const seasons = extractSeasons(data);
    setSeasonPrices(
      seasons.map((season) => ({
        season,
        mbxPrice: 0,
        pointPrice: 0,
      }))
    );
  };

  const handlePriceSubmit = (prices: SeasonPrice[]) => {
    setSeasonPrices(prices);
  };

  const generateSettlementData = () => {
    // 시즌 가격 입력 폼의 유효성 검사 및 포커스 이동
    if (!seasonPriceFormRef.current?.validateAndFocus()) {
      return;
    }

    // 모든 시즌 가격이 입력된 경우에만 정산 데이터 생성
    const settlement = calculateSettlement(excelData!, seasonPrices);
    setSettlementData(settlement);
    setStep(2);
  };

  const handleValidationError = (message: string) => {
    setValidationError(message);
    // 3초 후 에러 메시지 제거
    setTimeout(() => setValidationError(null), 3000);
  };

  return (
    <main className="container mx-auto p-4 space-y-6">
      {step === 1 ? (
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">엑셀 파일 업로드</h2>
            <FileUpload onUpload={handleFileUpload} />
          </section>

          {validationError && (
            <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg">
              {validationError}
            </div>
          )}

          {excelData && (
            <>
              {seasonPrices.length > 0 && (
                <section className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-2xl font-bold mb-4">MBX 시세</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <SeasonPriceForm
                      seasonPrices={seasonPrices}
                      onSubmit={handlePriceSubmit}
                      onValidationError={handleValidationError}
                      ref={seasonPriceFormRef}
                    />
                  </div>
                </section>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!seasonPriceFormRef.current?.validateAndFocus()) {
                      return;
                    }
                    generateSettlementData();
                  }}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  정산용 데이터 생성
                </button>
              </div>

              <section className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">업로드된 데이터</h2>
                <DataTable data={excelData.data} />
              </section>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!seasonPriceFormRef.current?.validateAndFocus()) {
                      return;
                    }
                    generateSettlementData();
                  }}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
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
    let remainingPoints = Number(row["포인트(정산신청)"]);
    const seasons = [...seasonPrices].sort((a, b) => b.season - a.season);
    const lastSeasonPrice = seasons[0];

    // 인센티브와 사전모집특전 계산 (마지막 시즌 시세 기준)
    const incentivePoints = Number(row["인센티브"]) || 0;
    const earlyBirdPoints = Number(row["사전모집 특전"]) || 0;
    // MBX 계산 로직 변경
    const incentiveMbx =
      Math.round(
        (incentivePoints * lastSeasonPrice.pointPrice) /
          lastSeasonPrice.mbxPrice /
          100
      ) * 100;
    const earlyBirdMbx =
      Math.round(
        (earlyBirdPoints * lastSeasonPrice.pointPrice) /
          lastSeasonPrice.mbxPrice /
          100
      ) * 100;

    remainingPoints -= incentivePoints + earlyBirdPoints;

    // 시즌별 포인트 계산
    let seasonMbx = 0;
    let lastUsedSeason = 0;
    const seasonPointsMap = new Map<number, number>();

    for (const season of seasons) {
      if (remainingPoints <= 0) {
        // remainingPoints가 0이 된 시점이 마지막으로 수령했던 시즌
        lastUsedSeason = season.season;
        break;
      }

      const pointsToUse = Number(row[`포인트(시즌${season.season})`] || 0);

      if (pointsToUse > 0) {
        const mbx =
          Math.round(
            (pointsToUse * season.pointPrice) / season.mbxPrice / 100
          ) * 100;
        seasonMbx += mbx;
        remainingPoints -= pointsToUse;
        seasonPointsMap.set(season.season, pointsToUse);

        // 마지막 시즌까지 처리했는데 remainingPoints가 남은 경우
        if (season === seasons[seasons.length - 1] && remainingPoints > 0) {
          lastUsedSeason = season.season;
        }
      }
    }

    const totalMbx = seasonMbx + incentiveMbx + earlyBirdMbx;

    // 시즌별 포인트를 문자열로 변환 (시즌3:1000, 시즌2:2000 형식)
    const seasonPointsString = Array.from(seasonPointsMap.entries())
      .sort((a, b) => b[0] - a[0]) // 시즌 번호 내림차순 정렬
      .map(([season, points]) => `시즌${season}:${points}`)
      .join(", ");

    return {
      no: Number(row["no"] || row["NO"] || row["No"] || 0),
      creatorId: String(row["크리에이터ID"]),
      creatorName: String(row["크리에이터명"]),
      walletAddress: String(row["지갑 주소"]),
      totalPoints: Number(row["포인트(정산신청)"]),
      totalMbx,
      earlyBirdMbx,
      incentiveMbx,
      seasonMbx,
      lastUsedSeason,
      earlyBirdPoints,
      incentivePoints,
      seasonPoints: seasonPointsString,
    };
  });
}
