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
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { extractText, OCRProgress } from "@/lib/ocr";
import { parseTransactionFromText, ParsedTransaction } from "@/lib/transaction-parser";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const { addTransaction } = usePortfolio();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null);
  const [ocrResult, setOcrResult] = useState<ParsedTransaction | null>(null);
  const [formData, setFormData] = useState({
    type: "buy" as "buy" | "sell",
    ticker: "",
    name: "",
    quantity: "",
    price: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setOcrProgress({ status: "initializing", progress: 0 });

    try {
      // Extract text from image using OCR
      const extractedText = await extractText(selectedFile, (progress) => {
        setOcrProgress(progress);
      });

      console.log("Extracted text:", extractedText);

      // Parse the extracted text to get transaction data
      const parsed = parseTransactionFromText(extractedText);
      setOcrResult(parsed);

      console.log("Parsed transaction:", parsed);

      // Auto-fill the form with parsed data
      setFormData({
        type: parsed.type || "buy",
        ticker: parsed.ticker || "",
        name: parsed.name || "",
        quantity: parsed.quantity?.toString() || "",
        price: parsed.price?.toString() || "",
        date: parsed.date || new Date().toISOString().split('T')[0],
      });

      setIsProcessing(false);
      setOcrProgress(null);
    } catch (error) {
      console.error("OCR processing error:", error);
      setIsProcessing(false);
      setOcrProgress(null);
      alert(`Kunne ikke lese sluttseddelen automatisk: ${error instanceof Error ? error.message : 'Ukjent feil'}\n\nVennligst fyll ut informasjonen manuelt.`);
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
    setOcrResult(null);
    setFormData({
      type: "buy",
      ticker: "",
      name: "",
      quantity: "",
      price: "",
      date: new Date().toISOString().split('T')[0],
    });
  };

  const getConfidenceColor = (confidence?: "high" | "medium" | "low") => {
    switch (confidence) {
      case "high": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getConfidenceIcon = (confidence?: "high" | "medium" | "low") => {
    switch (confidence) {
      case "high": return <CheckCircle2 className="w-4 h-4" />;
      case "medium": return <AlertCircle className="w-4 h-4" />;
      case "low": return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Last opp sluttseddel</DialogTitle>
          <DialogDescription>
            Last opp et bilde av sluttseddelen, så leser vi informasjonen automatisk
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* File upload */}
            <div className="grid gap-2">
              <Label htmlFor="file">Sluttseddel (JPG, PNG)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  disabled={isProcessing}
                />
                {file && !isProcessing && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {file.name}
                  </span>
                )}
              </div>
            </div>

            {/* Processing indicator */}
            {isProcessing && ocrProgress && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Leser sluttseddel...
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {ocrProgress.status} - {ocrProgress.progress}%
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OCR Result indicator */}
            {ocrResult && !isProcessing && (
              <div className={`border rounded-lg p-3 ${
                ocrResult.confidence === "high" ? "bg-green-50 border-green-200" :
                ocrResult.confidence === "medium" ? "bg-yellow-50 border-yellow-200" :
                "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-center gap-2">
                  <span className={getConfidenceColor(ocrResult.confidence)}>
                    {getConfidenceIcon(ocrResult.confidence)}
                  </span>
                  <p className={`text-sm font-medium ${getConfidenceColor(ocrResult.confidence)}`}>
                    {ocrResult.confidence === "high" && "Informasjon lest! Sjekk feltene nedenfor."}
                    {ocrResult.confidence === "medium" && "Noe informasjon funnet. Vennligst kontroller feltene."}
                    {ocrResult.confidence === "low" && "Kunne ikke lese all informasjon. Vennligst fyll ut manuelt."}
                  </p>
                </div>
              </div>
            )}

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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Prosesserer...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Registrer transaksjon
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
