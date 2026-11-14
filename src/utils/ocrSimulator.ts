/**
 * Stubbed Vision OCR Engine (Simulating AWS Bedrock / LLM Vision API for ITS Cards)
 */

export interface OCRResult {
  extractedIts: string;
  extractedName: string;
  confidence: number;
  isItsValidFormat: boolean;
  matchesEnteredName: boolean;
  matchesEnteredIts: boolean;
  summary: string;
}

export async function simulateItsCardOCR(
  submittedName: string,
  submittedIts: string,
  _cardImageDataUrl: string
): Promise<OCRResult> {
  // Simulate network & vision processing latency
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const cleanSubmittedIts = submittedIts.trim();
  const isItsValidFormat = /^\d{8}$/.test(cleanSubmittedIts);

  // If user provided a valid 8-digit ITS, simulate high confidence OCR match
  const extractedIts = isItsValidFormat ? cleanSubmittedIts : '30491823';
  const extractedName = submittedName.toUpperCase().trim();

  const confidence = 96.5 + Math.random() * 3.0; // 96.5% - 99.5%
  const matchesEnteredIts = isItsValidFormat;
  const matchesEnteredName = submittedName.trim().length > 3;

  return {
    extractedIts,
    extractedName,
    confidence: Number(confidence.toFixed(1)),
    isItsValidFormat,
    matchesEnteredName,
    matchesEnteredIts,
    summary: matchesEnteredIts && matchesEnteredName
      ? `Successfully extracted 8-digit ITS (${extractedIts}) and verified name match (${extractedName}) with ${confidence.toFixed(1)}% vision confidence.`
      : `Discrepancy detected in card proof. Queued for community admin manual review.`,
  };
}
