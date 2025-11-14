"use client";

import { KPIGrid } from "@/components/dashboard/kpi-grid";
import { HoldingCard } from "@/components/dashboard/holding-card";
import { ActionBar } from "@/components/dashboard/action-bar";
import { usePortfolio } from "@/components/providers/portfolio-provider";

export default function DashboardPage() {
  const { holdings, portfolio } = usePortfolio();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Aksjeportefølje</h1>
        <p className="text-muted-foreground">
          Oversikt over dine investeringer og avkastning
        </p>
      </div>

      {/* Action Bar */}
      <ActionBar />

      {/* KPI Grid */}
      <KPIGrid data={portfolio} />

      {/* Holdings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {holdings.map((holding) => (
          <HoldingCard key={holding.id} holding={holding} />
        ))}
      </div>
    </div>
  );
}
