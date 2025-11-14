/**
 * Interface for parsed transaction data from a sluttseddel (trade confirmation)
 */
export interface ParsedTransaction {
  type?: "buy" | "sell";
  ticker?: string;
  name?: string;
  quantity?: number;
  price?: number;
  date?: string;
  confidence: "high" | "medium" | "low";
  rawText?: string;
}

/**
 * Parses OCR text to extract transaction information
 * @param text - The OCR extracted text
 * @returns Parsed transaction data
 */
export function parseTransactionFromText(text: string): ParsedTransaction {
  const result: ParsedTransaction = {
    confidence: "low",
    rawText: text,
  };

  // Normalize text: remove extra spaces and newlines
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  console.log("Normalized OCR text:", normalizedText);

  // Try Nordnet format first (ordrehistorikk)
  const nordnetParsed = parseNordnetFormat(normalizedText);
  if (nordnetParsed && nordnetParsed.confidence !== "low") {
    console.log("Nordnet format detected:", nordnetParsed);
    return nordnetParsed;
  }

  // Detect transaction type (kjøp/salg)
  const transactionType = detectTransactionType(normalizedText);
  if (transactionType) {
    result.type = transactionType;
    result.confidence = "medium";
  }

  // Extract ticker symbol (usually 3-5 uppercase letters)
  const ticker = extractTicker(normalizedText);
  if (ticker) {
    result.ticker = ticker;
  }

  // Extract company name
  const companyName = extractCompanyName(normalizedText, ticker);
  if (companyName) {
    result.name = companyName;
  }

  // Extract quantity (antall aksjer)
  const quantity = extractQuantity(normalizedText);
  if (quantity) {
    result.quantity = quantity;
  }

  // Extract price (kurs/pris per aksje)
  const price = extractPrice(normalizedText);
  if (price) {
    result.price = price;
  }

  // Extract date
  const date = extractDate(normalizedText);
  if (date) {
    result.date = date;
  }

  // Determine confidence level
  result.confidence = determineConfidence(result);

  return result;
}

/**
 * Parses Nordnet order history format
 * Format: "Navn ... Kjop/Selg Antall Limit ..."
 */
function parseNordnetFormat(text: string): ParsedTransaction | null {
  const result: ParsedTransaction = {
    confidence: "low",
    rawText: text,
  };

  // Nordnet pattern: Name ... Kjop/Selg Number Number(,/.)Number ...
  // Example: "Noram Drilling ... oO 100% Kjop 6000 25,000 27.350"

  // Look for the transaction type first
  const typeMatch = text.match(/\b(Kjop|Kjøp|Selg|Salg)\b/i);
  if (!typeMatch) return null;

  result.type = typeMatch[1].toLowerCase().includes('kjop') || typeMatch[1].toLowerCase().includes('kjøp') ? 'buy' : 'sell';
  const typeIndex = typeMatch.index || 0;

  // Extract company name (everything before the type, but after common headers)
  const beforeType = text.substring(0, typeIndex);
  const nameMatch = beforeType.match(/([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)*)\s*\.{0,3}\s*[oO0]*\s*\d{0,3}%?\s*$/);
  if (nameMatch && nameMatch[1]) {
    result.name = nameMatch[1].trim();
  }

  // Extract quantity and price after the type
  const afterType = text.substring(typeIndex + typeMatch[0].length);

  // Pattern: Number(space)Number[,.]Number
  // First large number is quantity, second is price
  const numbersMatch = afterType.match(/\b(\d{1,})\s+(\d{1,})[,.](\d{1,})/);
  if (numbersMatch) {
    result.quantity = parseInt(numbersMatch[1].replace(/\s/g, ''), 10);
    result.price = parseFloat(`${numbersMatch[2]}.${numbersMatch[3]}`);
  }

  // Extract date if present
  const dateMatch = text.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (dateMatch) {
    const day = dateMatch[1];
    const month = dateMatch[2];
    const year = dateMatch[3];
    result.date = `${year}-${month}-${day}`;
  }

  // Determine confidence
  let score = 0;
  if (result.type) score++;
  if (result.name) score++;
  if (result.quantity) score++;
  if (result.price) score++;
  if (result.date) score++;

  if (score >= 4) {
    result.confidence = "high";
  } else if (score >= 3) {
    result.confidence = "medium";
  } else {
    result.confidence = "low";
  }

  return result;
}

/**
 * Detects if the transaction is a buy or sell
 */
function detectTransactionType(text: string): "buy" | "sell" | undefined {
  const lowerText = text.toLowerCase();

  // Norwegian buy keywords
  if (lowerText.includes('kjøp') || lowerText.includes('kjopt') || lowerText.includes('bought')) {
    return 'buy';
  }

  // Norwegian sell keywords
  if (lowerText.includes('salg') || lowerText.includes('solgt') || lowerText.includes('sold')) {
    return 'sell';
  }

  return undefined;
}

/**
 * Extracts ticker symbol from text
 */
function extractTicker(text: string): string | undefined {
  // Pattern 1: Look for 3-5 uppercase letters (typical ticker format)
  // Often appears after keywords like "Verdipapir:", "Instrument:", "Aksje:"
  const tickerPatterns = [
    /(?:Verdipapir|Instrument|Aksje|Symbol|Ticker)[:\s]+([A-Z]{2,5})/i,
    /\b([A-Z]{3,5})\b(?=\s+(?:aksje|stock|share))/i,
    /\b([A-Z]{3,5})\s+OSE/i, // Oslo Stock Exchange
    /\b([A-Z]{3,5})\.OSE/i,
  ];

  for (const pattern of tickerPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  // Fallback: Look for standalone uppercase words that could be tickers
  const words = text.split(/\s+/);
  for (const word of words) {
    if (/^[A-Z]{3,5}$/.test(word)) {
      return word;
    }
  }

  return undefined;
}

/**
 * Extracts company name from text
 */
function extractCompanyName(text: string, ticker?: string): string | undefined {
  if (!ticker) return undefined;

  // Try to find text near the ticker
  const tickerIndex = text.indexOf(ticker);
  if (tickerIndex === -1) return undefined;

  // Look at text around the ticker (before and after)
  const beforeTicker = text.substring(Math.max(0, tickerIndex - 50), tickerIndex).trim();
  const afterTicker = text.substring(tickerIndex + ticker.length, tickerIndex + ticker.length + 50).trim();

  // Pattern: Company name usually comes before or after ticker
  const namePatterns = [
    /([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)*)\s*$/,  // Before ticker
    /^\s*([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)*)/,  // After ticker
  ];

  for (const pattern of namePatterns) {
    let match = beforeTicker.match(pattern);
    if (match && match[1].length > 3) {
      return match[1].trim();
    }
    match = afterTicker.match(pattern);
    if (match && match[1].length > 3) {
      return match[1].trim();
    }
  }

  return undefined;
}

/**
 * Extracts quantity (number of shares) from text
 */
function extractQuantity(text: string): number | undefined {
  const quantityPatterns = [
    /(?:Antall|Quantity|Stykk|Aksjer|Shares)[:\s]+([0-9]+(?:[,\s][0-9]+)*)/i,
    /(?:Antall|Quantity)[:\s]+([0-9\s,]+)/i,
    /([0-9]+)\s+(?:stk|aksjer|shares)/i,
  ];

  for (const pattern of quantityPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Remove spaces and commas, then parse
      const numStr = match[1].replace(/[\s,]/g, '');
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > 0 && num < 1000000) {
        return num;
      }
    }
  }

  return undefined;
}

/**
 * Extracts price per share from text
 */
function extractPrice(text: string): number | undefined {
  const pricePatterns = [
    /(?:Kurs|Pris|Price|Rate)[:\s]+([0-9]+[.,][0-9]+)/i,
    /(?:kr|NOK|Kr)[.\s]+([0-9]+[.,][0-9]+)/i,
    /([0-9]+[.,][0-9]{2})\s*(?:kr|NOK)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Convert comma to period for parsing
      const numStr = match[1].replace(',', '.');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0 && num < 1000000) {
        return num;
      }
    }
  }

  return undefined;
}

/**
 * Extracts date from text
 */
function extractDate(text: string): string | undefined {
  const datePatterns = [
    // DD.MM.YYYY or DD/MM/YYYY
    /(?:Dato|Date|Handelsdag)[:\s]+(\d{1,2})[./](\d{1,2})[./](\d{4})/i,
    /(\d{1,2})[./](\d{1,2})[./](\d{4})/,
    // YYYY-MM-DD
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      let year: string, month: string, day: string;

      if (match[1].length === 4) {
        // YYYY-MM-DD format
        year = match[1];
        month = match[2].padStart(2, '0');
        day = match[3].padStart(2, '0');
      } else {
        // DD.MM.YYYY or DD/MM/YYYY format
        day = match[1].padStart(2, '0');
        month = match[2].padStart(2, '0');
        year = match[3];
      }

      // Validate date
      const date = new Date(`${year}-${month}-${day}`);
      if (!isNaN(date.getTime())) {
        return `${year}-${month}-${day}`;
      }
    }
  }

  return undefined;
}

/**
 * Determines the confidence level based on how many fields were successfully extracted
 */
function determineConfidence(result: ParsedTransaction): "high" | "medium" | "low" {
  let score = 0;

  if (result.type) score++;
  if (result.ticker) score++;
  if (result.quantity) score++;
  if (result.price) score++;
  if (result.date) score++;

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}
