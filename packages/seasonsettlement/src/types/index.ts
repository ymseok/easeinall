export interface ExcelData {
  headers: string[];
  data: Record<string, string | number>[];
}

export interface SeasonPrice {
  season: number;
  price: number;
}

export interface SettlementData {
  seasonNumber: number;
  points: number;
  mbxPrice: number;
  calculatedValue: number;
}
