export interface ExcelData {
  headers: string[];
  data: Record<string, string | number>[];
}

export interface SeasonPrice {
  season: number;
  price: number;
}

export interface SettlementData {
  no: number;
  creatorId: string;
  creatorName: string;
  walletAddress: string;
  totalPoints: number;
  totalMbx: number;
  earlyBirdMbx: number;
  earlyBirdPoints: number;
  incentiveMbx: number;
  incentivePoints: number;
  seasonMbx: number;
  seasonPoints: string;
  lastUsedSeason: number;
}
