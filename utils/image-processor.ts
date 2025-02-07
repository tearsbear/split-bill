import Tesseract from "tesseract.js";
import { parseExtractedText } from "./bill-parser";
import type { Bill } from "@/types/bill";

export async function processImage(file: File): Promise<Bill> {
  try {
    const worker = await Tesseract.createWorker("ind");

    const result = await worker.recognize(file);
    // console.log("Extracted text:", result.data.text);

    await worker.terminate();

    // Parse the extracted text using our existing parser
    const bill = parseExtractedText(result.data.text);
    return bill;
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Failed to process the bill image. Please try again.");
  }
}
