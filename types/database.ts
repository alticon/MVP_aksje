export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Holding {
  id: string;
  portfolio_id: string;
  ticker: string;
  isin?: string;
  name: string;
  description?: string;
  quantity: number;
  avg_purchase_price: number;
  current_price?: number;
  last_price_update?: string;
  is_sold: boolean;
  sold_at?: string;
  ownership_type?: string;
  owner_name?: string;
  broker?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  portfolio_id: string;
  holding_id?: string;
  type: string;
  ticker: string;
  isin?: string;
  quantity: number;
  price_per_share: number;
  total_amount: number;
  fees: number;
  transaction_date: string;
  settlement_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Dividend {
  id: string;
  portfolio_id: string;
  holding_id: string;
  ticker: string;
  amount_per_share: number;
  total_amount: number;
  quantity: number;
  ex_dividend_date?: string;
  payment_date: string;
  withholding_tax: number;
  created_at: string;
}
