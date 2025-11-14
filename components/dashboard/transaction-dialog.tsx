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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePortfolio } from "@/components/providers/portfolio-provider";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDialog({ open, onOpenChange }: TransactionDialogProps) {
  const { addTransaction } = usePortfolio();
  const [formData, setFormData] = useState({
    type: "buy" as "buy" | "sell",
    ticker: "",
    name: "",
    quantity: "",
    price: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addTransaction({
      type: formData.type,
      ticker: formData.ticker,
      name: formData.name,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      date: formData.date,
    });

    alert(`Transaksjon registrert!\n${formData.type === "buy" ? "Kjøp" : "Salg"} av ${formData.quantity} ${formData.ticker} @ ${formData.price} kr\n\nSe nytt kort i dashboardet!`);
    onOpenChange(false);

    // Reset form
    setFormData({
      type: "buy",
      ticker: "",
      name: "",
      quantity: "",
      price: "",
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ny transaksjon</DialogTitle>
          <DialogDescription>
            Registrer kjøp eller salg av aksjer
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "buy" | "sell") => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Kjøp</SelectItem>
                  <SelectItem value="sell">Salg</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ticker">Ticker</Label>
              <Input
                id="ticker"
                placeholder="f.eks. AAPL, TSLA"
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Selskapsnavn (valgfritt)</Label>
              <Input
                id="name"
                placeholder="f.eks. Apple Inc."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Antall aksjer</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="f.eks. 10"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Pris per aksje (kr)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="f.eks. 150.50"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Dato</Label>
              <Input
                id="date"
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
            <Button type="submit">Lagre transaksjon</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
