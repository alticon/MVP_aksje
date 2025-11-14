"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Upload, Filter } from "lucide-react";
import { TransactionDialog } from "./transaction-dialog";
import { DividendDialog } from "./dividend-dialog";

export function ActionBar() {
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [dividendOpen, setDividendOpen] = useState(false);

  const handleUploadClick = () => {
    alert("Opplasting av sluttseddel kommer snart!");
  };

  const handleFilterClick = () => {
    alert("Filterfunksjon kommer snart!");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => setTransactionOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ny transaksjon
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600"
            onClick={() => setDividendOpen(true)}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Registrer utbytte
          </Button>
          <Button
            className="bg-cyan-500 hover:bg-cyan-600"
            onClick={handleUploadClick}
          >
            <Upload className="w-4 h-4 mr-2" />
            Last opp sluttseddel
          </Button>
        </div>
        <Button variant="outline" onClick={handleFilterClick}>
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <TransactionDialog
        open={transactionOpen}
        onOpenChange={setTransactionOpen}
      />
      <DividendDialog
        open={dividendOpen}
        onOpenChange={setDividendOpen}
      />
    </>
  );
}
