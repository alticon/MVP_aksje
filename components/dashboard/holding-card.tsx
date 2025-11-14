import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Edit, Trash2, RefreshCcw, Loader2 } from "lucide-react";
import { HoldingDisplay } from "@/types/holdings";
import { usePortfolio } from "@/components/providers/portfolio-provider";

interface HoldingCardProps {
  holding: HoldingDisplay;
}

export function HoldingCard({ holding }: HoldingCardProps) {
  const { updatePrice } = usePortfolio();
  const [isUpdating, setIsUpdating] = useState(false);
  const isPositive = holding.returnPercent > 0;

  const handleUpdatePrice = async () => {
    setIsUpdating(true);
    try {
      await updatePrice(holding.id);
      alert(`Kurs oppdatert for ${holding.ticker}!`);
    } catch (error) {
      console.error("Failed to update price:", error);
      alert("Kunne ikke oppdatere kurs. Prøv igjen senere.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold">{holding.name}</h3>
            <span className="text-sm text-muted-foreground">({holding.ticker})</span>
            {holding.isSold && (
              <Badge className="bg-green-500 text-white">SOLGT</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {holding.description}
          </p>
        </div>
        <div className={`flex items-center gap-1 text-xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          {holding.returnPercent} %
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b flex-wrap">
        <span>🔒 {holding.ownershipType}</span>
        <span>👤 {holding.ownerName}</span>
        <span>🏦 {holding.broker}</span>
      </div>

      {/* Data Grid */}
      {holding.isSold ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Kjøpsdato</p>
              <p className="text-base font-semibold">{holding.purchaseDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Salgsdato</p>
              <p className="text-base font-semibold">{holding.saleDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Antall aksjer</p>
              <p className="text-base font-semibold">{holding.quantity}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Gjennomsnittspris</p>
              <p className="text-base font-semibold">{holding.avgPrice} kr</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Salgspris</p>
              <p className="text-base font-semibold">{holding.salePrice?.toLocaleString("no-NO")} kr</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total kostverdi</p>
              <p className="text-base font-semibold">{holding.totalCost.toLocaleString("no-NO")} kr</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Salgsverdi</p>
              <p className="text-base font-semibold">{holding.saleValue?.toLocaleString("no-NO")} kr</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Realisert gevinst</p>
              <p className="text-base font-semibold text-green-600">{holding.realizedGain?.toLocaleString("no-NO")} kr</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Første kjøp</p>
              <p className="text-base font-semibold">{holding.purchaseDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Antall aksjer</p>
              <p className="text-base font-semibold">{holding.quantity.toLocaleString("no-NO")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gjennomsnittspris</p>
              <p className="text-base font-semibold">{holding.avgPrice} kr</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Dagens kurs</p>
              <p className="text-base font-semibold">{holding.currentPrice} kr</p>
              <p className="text-xs text-muted-foreground">
                ({holding.lowPrice}, {holding.highPrice})
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total kostverdi</p>
              <p className="text-base font-semibold">{holding.totalCost.toLocaleString("no-NO")} kr</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dagens verdi</p>
              <p className="text-base font-semibold">{holding.currentValue?.toLocaleString("no-NO")} kr</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Urealisert gevinst</p>
              <p className="text-base font-semibold text-green-600">{holding.unrealizedGain?.toLocaleString("no-NO")} kr</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Totalt utbytte</p>
              <p className="text-base font-semibold">{holding.dividends?.toLocaleString("no-NO")} kr</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avkastning m/utbytte</p>
              <p className="text-base font-semibold">{holding.totalReturn} %</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-6 pt-6 border-t flex-wrap">
        {!holding.isSold && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpdatePrice}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Oppdaterer...
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4 mr-1" />
                Oppdater kurs
              </>
            )}
          </Button>
        )}
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4 mr-1" />
          Rediger
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 className="w-4 h-4 mr-1" />
          Slett
        </Button>
      </div>
    </Card>
  );
}
