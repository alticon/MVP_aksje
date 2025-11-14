"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { HoldingDisplay, PortfolioSummary } from "@/types/holdings";
import { mockHoldings, mockPortfolio } from "@/lib/mock-data";

interface PortfolioContextType {
  holdings: HoldingDisplay[];
  portfolio: PortfolioSummary;
  addTransaction: (transaction: {
    type: "buy" | "sell";
    ticker: string;
    quantity: number;
    price: number;
    date: string;
    name?: string;
    description?: string;
  }) => void;
  addDividend: (dividend: {
    ticker: string;
    amount: number;
    date: string;
  }) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [holdings, setHoldings] = useState<HoldingDisplay[]>(mockHoldings);
  const [portfolio, setPortfolio] = useState<PortfolioSummary>(mockPortfolio);

  const addTransaction = (transaction: {
    type: "buy" | "sell";
    ticker: string;
    quantity: number;
    price: number;
    date: string;
    name?: string;
    description?: string;
  }) => {
    const { type, ticker, quantity, price, date, name, description } = transaction;

    // Find existing holding with same ticker
    const existingHoldingIndex = holdings.findIndex(
      (h) => h.ticker.toLowerCase() === ticker.toLowerCase() && !h.isSold
    );

    if (type === "buy") {
      if (existingHoldingIndex >= 0) {
        // Update existing holding
        const updatedHoldings = [...holdings];
        const existing = updatedHoldings[existingHoldingIndex];
        const totalQuantity = existing.quantity + quantity;
        const totalCost = existing.totalCost + (quantity * price);
        const avgPrice = totalCost / totalQuantity;

        updatedHoldings[existingHoldingIndex] = {
          ...existing,
          quantity: totalQuantity,
          avgPrice: avgPrice,
          totalCost: totalCost,
          currentValue: totalQuantity * (existing.currentPrice || price),
          unrealizedGain: (totalQuantity * (existing.currentPrice || price)) - totalCost,
        };

        setHoldings(updatedHoldings);
      } else {
        // Create new holding
        const newHolding: HoldingDisplay = {
          id: Date.now().toString(),
          name: name || ticker,
          ticker: ticker.toUpperCase(),
          description: description || `Aksje i ${name || ticker}`,
          isSold: false,
          returnPercent: 0,
          ownershipType: "Privat",
          ownerName: "Demo User",
          broker: "Demo Broker",
          purchaseDate: date,
          quantity: quantity,
          avgPrice: price,
          currentPrice: price,
          totalCost: quantity * price,
          currentValue: quantity * price,
          unrealizedGain: 0,
          dividends: 0,
          totalReturn: 0,
        };

        setHoldings([...holdings, newHolding]);

        // Update portfolio summary
        setPortfolio({
          ...portfolio,
          totalCost: portfolio.totalCost + (quantity * price),
          currentValue: portfolio.currentValue + (quantity * price),
          activePositions: portfolio.activePositions + 1,
        });
      }
    } else if (type === "sell") {
      if (existingHoldingIndex >= 0) {
        const updatedHoldings = [...holdings];
        const existing = updatedHoldings[existingHoldingIndex];

        // Mark as sold
        updatedHoldings[existingHoldingIndex] = {
          ...existing,
          isSold: true,
          saleDate: date,
          salePrice: price,
          saleValue: quantity * price,
          realizedGain: (quantity * price) - (existing.avgPrice * quantity),
          returnPercent: ((quantity * price) / (existing.avgPrice * quantity) - 1) * 100,
        };

        setHoldings(updatedHoldings);

        // Update portfolio summary
        const realizedGain = (quantity * price) - (existing.avgPrice * quantity);
        setPortfolio({
          ...portfolio,
          totalGain: portfolio.totalGain + realizedGain,
          activePositions: Math.max(0, portfolio.activePositions - 1),
          soldPositions: portfolio.soldPositions + 1,
        });
      }
    }
  };

  const addDividend = (dividend: { ticker: string; amount: number; date: string }) => {
    const { ticker, amount } = dividend;

    // Find holding with ticker
    const holdingIndex = holdings.findIndex(
      (h) => h.ticker.toLowerCase() === ticker.toLowerCase()
    );

    if (holdingIndex >= 0) {
      const updatedHoldings = [...holdings];
      const existing = updatedHoldings[holdingIndex];

      updatedHoldings[holdingIndex] = {
        ...existing,
        dividends: (existing.dividends || 0) + amount,
      };

      setHoldings(updatedHoldings);

      // Update portfolio summary
      setPortfolio({
        ...portfolio,
        totalDividends: portfolio.totalDividends + amount,
      });
    }
  };

  return (
    <PortfolioContext.Provider value={{ holdings, portfolio, addTransaction, addDividend }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
