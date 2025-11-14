"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DividendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DividendDialog({ open, onOpenChange }: DividendDialogProps) {
  const [formData, setFormData] = useState({
    ticker: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Utbytte:", formData);
    // TODO: Send til backend/database
    alert(`Utbytte registrert!\n${formData.ticker}: ${formData.amount} kr`);
    onOpenChange(false);
    // Reset form
    setFormData({
      ticker: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrer utbytte</DialogTitle>
          <DialogDescription>
            Legg til utbytte fra aksjer
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dividend-ticker">Ticker</Label>
              <Input
                id="dividend-ticker"
                placeholder="f.eks. AAPL, TSLA"
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Utbyttebeløp (kr)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="f.eks. 500.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dividend-date">Dato</Label>
              <Input
                id="dividend-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit">Lagre utbytte</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
