export interface HoldingDisplay {
  id: string;
  name: string;
  ticker: string;
  description?: string;
  isSold: boolean;
  returnPercent: number;
  ownershipType?: string;
  ownerName?: string;
  broker?: string;
  purchaseDate: string;
  saleDate?: string;
  quantity: number;
  avgPrice: number;
  currentPrice?: number;
  lowPrice?: number;
  highPrice?: number;
  salePrice?: number;
  totalCost: number;
  currentValue?: number;
  saleValue?: number;
  unrealizedGain?: number;
  realizedGain?: number;
  dividends?: number;
  totalReturn?: number;
}

export interface PortfolioSummary {
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  currentValue: number;
  totalDividends: number;
  dividendYield: number;
  activePositions: number;
  soldPositions: number;
}
