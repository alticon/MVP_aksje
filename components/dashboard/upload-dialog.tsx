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
import { Upload } from "lucide-react";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const { addTransaction } = usePortfolio();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    type: "buy" as "buy" | "sell",
    ticker: "",
    name: "",
    quantity: "",
    price: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // TODO: Parse file and extract transaction data
      // For now, just show that file was uploaded
      alert(`Fil lastet opp: ${selectedFile.name}\n\nFyll ut transaksjonsinformasjonen manuelt.`);
    }
  };

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

    alert(`Transaksjon fra sluttseddel registrert!\n${formData.type === "buy" ? "Kjøp" : "Salg"} av ${formData.quantity} ${formData.ticker}\n\nSe nytt kort i dashboardet!`);
    onOpenChange(false);

    // Reset form
    setFile(null);
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
          <DialogTitle>Last opp sluttseddel</DialogTitle>
          <DialogDescription>
            Last opp sluttseddel og registrer transaksjonen
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* File upload */}
            <div className="grid gap-2">
              <Label htmlFor="file">Sluttseddel (PDF, bilde)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {file && (
                  <span className="text-sm text-green-600">✓ {file.name}</span>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-4">
                Fyll ut transaksjonsinformasjon:
              </p>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="upload-type">Type</Label>
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
                  <Label htmlFor="upload-ticker">Ticker</Label>
                  <Input
                    id="upload-ticker"
                    placeholder="f.eks. AAPL, TSLA"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="upload-name">Selskapsnavn (valgfritt)</Label>
                  <Input
                    id="upload-name"
                    placeholder="f.eks. Apple Inc."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="upload-quantity">Antall aksjer</Label>
                  <Input
                    id="upload-quantity"
                    type="number"
                    placeholder="f.eks. 10"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="upload-price">Pris per aksje (kr)</Label>
                  <Input
                    id="upload-price"
                    type="number"
                    step="0.01"
                    placeholder="f.eks. 150.50"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="upload-date">Dato</Label>
                  <Input
                    id="upload-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit">
              <Upload className="w-4 h-4 mr-2" />
              Registrer transaksjon
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
