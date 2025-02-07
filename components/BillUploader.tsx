import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { processImage } from "@/utils/image-processor";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import type { Bill } from "@/types/bill";

interface BillUploaderProps {
  onBillProcessed: (bill: Bill, previewUrl: string) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

export default function BillUploader({
  onBillProcessed,
  isProcessing,
  setIsProcessing,
}: BillUploaderProps) {
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Create image preview URL
    const previewUrl = URL.createObjectURL(file);
    setIsProcessing(true);
    toast.loading("Processing bill image...");

    try {
      const bill = await processImage(file);
      onBillProcessed(bill, previewUrl);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process image"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={isProcessing}
        className="hidden"
        id="bill-upload"
      />
      <Button
        asChild
        variant="outline"
        className="w-full"
        disabled={isProcessing}
      >
        <label htmlFor="bill-upload" className="cursor-pointer">
          <Upload className="w-4 h-4 mr-2" />
          {isProcessing ? "Processing..." : "Upload Bill Image"}
        </label>
      </Button>
    </>
  );
}
