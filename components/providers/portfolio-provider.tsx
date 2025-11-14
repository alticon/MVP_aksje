"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
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
  updatePrice: (holdingId: string) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [holdings, setHoldings] = useState<HoldingDisplay[]>(mockHoldings);
  const [portfolio, setPortfolio] = useState<PortfolioSummary>(mockPortfolio);

  const addTransaction = useCallback((transaction: {
    type: "buy" | "sell";
    ticker: string;
    quantity: number;
    price: number;
    date: string;
    name?: string;
    description?: string;
  }) => {
    console.log("Adding transaction:", transaction);

    const { type, ticker, quantity, price, date, name, description } = transaction;

    setHoldings(currentHoldings => {
      // Find existing holding with same ticker
      const existingHoldingIndex = currentHoldings.findIndex(
        (h) => h.ticker.toLowerCase() === ticker.toLowerCase() && !h.isSold
      );

      if (type === "buy") {
        if (existingHoldingIndex >= 0) {
          // Update existing holding
          const updatedHoldings = [...currentHoldings];
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

          console.log("Updated existing holding:", updatedHoldings[existingHoldingIndex]);
          return updatedHoldings;
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

          console.log("Created new holding:", newHolding);

          // Update portfolio summary
          setPortfolio(currentPortfolio => ({
            ...currentPortfolio,
            totalCost: currentPortfolio.totalCost + (quantity * price),
            currentValue: currentPortfolio.currentValue + (quantity * price),
            activePositions: currentPortfolio.activePositions + 1,
          }));

          return [...currentHoldings, newHolding];
        }
      } else if (type === "sell") {
        if (existingHoldingIndex >= 0) {
          const updatedHoldings = [...currentHoldings];
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

          console.log("Marked holding as sold:", updatedHoldings[existingHoldingIndex]);

          // Update portfolio summary
          const realizedGain = (quantity * price) - (existing.avgPrice * quantity);
          setPortfolio(currentPortfolio => ({
            ...currentPortfolio,
            totalGain: currentPortfolio.totalGain + realizedGain,
            activePositions: Math.max(0, currentPortfolio.activePositions - 1),
            soldPositions: currentPortfolio.soldPositions + 1,
          }));

          return updatedHoldings;
        }
      }

      return currentHoldings;
    });
  }, []);

  const addDividend = useCallback((dividend: { ticker: string; amount: number; date: string }) => {
    console.log("Adding dividend:", dividend);

    const { ticker, amount } = dividend;

    setHoldings(currentHoldings => {
      // Find holding with ticker
      const holdingIndex = currentHoldings.findIndex(
        (h) => h.ticker.toLowerCase() === ticker.toLowerCase()
      );

      if (holdingIndex >= 0) {
        const updatedHoldings = [...currentHoldings];
        const existing = updatedHoldings[holdingIndex];

        updatedHoldings[holdingIndex] = {
          ...existing,
          dividends: (existing.dividends || 0) + amount,
        };

        console.log("Updated holding with dividend:", updatedHoldings[holdingIndex]);

        // Update portfolio summary
        setPortfolio(currentPortfolio => ({
          ...currentPortfolio,
          totalDividends: currentPortfolio.totalDividends + amount,
        }));

        return updatedHoldings;
      }

      console.log("Holding not found for ticker:", ticker);
      return currentHoldings;
    });
  }, []);

  const updatePrice = useCallback(async (holdingId: string): Promise<void> => {
    console.log("Updating price for holding:", holdingId);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setHoldings(currentHoldings => {
      const holdingIndex = currentHoldings.findIndex(h => h.id === holdingId);

      if (holdingIndex >= 0) {
        const updatedHoldings = [...currentHoldings];
        const existing = updatedHoldings[holdingIndex];

        // Simulate price update - random change between -5% and +5%
        const priceChange = existing.currentPrice ? (existing.currentPrice * (Math.random() * 0.1 - 0.05)) : 0;
        const newPrice = Math.max(0.01, (existing.currentPrice || existing.avgPrice) + priceChange);

        // Calculate new values
        const currentValue = existing.quantity * newPrice;
        const unrealizedGain = currentValue - existing.totalCost;
        const returnPercent = ((currentValue / existing.totalCost) - 1) * 100;

        updatedHoldings[holdingIndex] = {
          ...existing,
          currentPrice: parseFloat(newPrice.toFixed(2)),
          currentValue: parseFloat(currentValue.toFixed(2)),
          unrealizedGain: parseFloat(unrealizedGain.toFixed(2)),
          returnPercent: parseFloat(returnPercent.toFixed(2)),
          lowPrice: parseFloat(Math.max(0.01, newPrice * 0.98).toFixed(2)),
          highPrice: parseFloat((newPrice * 1.02).toFixed(2)),
        };

        console.log("Updated price for holding:", updatedHoldings[holdingIndex]);

        return updatedHoldings;
      }

      console.log("Holding not found with id:", holdingId);
      return currentHoldings;
    });
  }, []);

  return (
    <PortfolioContext.Provider value={{ holdings, portfolio, addTransaction, addDividend, updatePrice }}>
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
