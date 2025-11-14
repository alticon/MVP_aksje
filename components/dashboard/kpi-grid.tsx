import { Wallet, TrendingUp, PiggyBank, DollarSign } from "lucide-react";
import { KPICard } from "./kpi-card";
import { PortfolioSummary } from "@/types/holdings";

interface KPIGridProps {
  data: PortfolioSummary;
}

export function KPIGrid({ data }: KPIGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <KPICard
        title="Total kostverdi"
        value={`${data.totalCost.toLocaleString("no-NO")} kr`}
        subtitle={`${data.activePositions} aktive, ${data.soldPositions} solgte`}
        icon={Wallet}
        gradient="bg-gradient-to-br from-blue-500 to-blue-600"
      />
      <KPICard
        title="Total gevinst"
        value={`${data.totalGain.toLocaleString("no-NO")} kr`}
        subtitle={`${data.totalGainPercent} %`}
        icon={TrendingUp}
        gradient="bg-gradient-to-br from-green-500 to-green-600"
      />
      <KPICard
        title="Dagens verdi"
        value={`${data.currentValue.toLocaleString("no-NO")} kr`}
        subtitle="Aktive posisjoner"
        icon={PiggyBank}
        gradient="bg-gradient-to-br from-cyan-500 to-cyan-600"
      />
      <KPICard
        title="Totalt utbytte"
        value={`${data.totalDividends.toLocaleString("no-NO")} kr`}
        subtitle={`${data.dividendYield} % m/utbytte`}
        icon={DollarSign}
        gradient="bg-gradient-to-br from-orange-500 to-orange-600"
      />
    </div>
  );
}
