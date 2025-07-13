"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Scan, X, Check, FileImage } from "lucide-react";
import { useConvexAction } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { getCategoryById } from "@/lib/expense-categories";
import { toast } from "sonner";

export function ReceiptScanner({ onReceiptParsed }) {
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  
  const fileInputRef = useRef(null);
  const parseReceipt = useConvexAction(api.receipts.parseReceipt);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be less than 5MB");
      return;
    }

    setOriginalFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result);
    reader.readAsDataURL(file);

    setIsScanning(true);
    setParseResult(null);

    try {
      // Convert file to base64 for API
      const base64 = await fileToBase64(file);
      
      const result = await parseReceipt({
        image: base64,
        filename: file.name,
      });

      if (result.success) {
        setParseResult(result.data);
        toast.success("Receipt scanned successfully!");
      } else {
        toast.error(result.error || "Failed to scan receipt");
      }
    } catch (error) {
      console.error("Receipt parsing failed:", error);
      toast.error("Failed to scan receipt. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleUseReceipt = () => {
    if (!parseResult || !onReceiptParsed) return;

    onReceiptParsed({
      ...parseResult.suggestedExpense,
      receiptImageUrl: parseResult.imageUrl,
      receiptData: parseResult.receiptData,
    });

    // Clear state
    setPreviewUrl(null);
    setParseResult(null);
    setOriginalFile(null);
    setIsScanning(false);
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setParseResult(null);
    setOriginalFile(null);
    setIsScanning(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="animate-fade-in hover-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Receipt Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!previewUrl ? (
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  Upload a receipt photo
                </p>
                <p className="text-xs text-muted-foreground">
                  Automatically extract expense details
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={triggerFileInput}
                  className="animate-hover-lift"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <Button
                  variant="outline"
                  onClick={triggerFileInput}
                  className="animate-hover-lift"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative">
              <Image
                src={previewUrl}
                alt="Receipt preview"
                width={400}
                height={192}
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
              {originalFile && (
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    <FileImage className="h-3 w-3 mr-1" />
                    {originalFile.name}
                  </Badge>
                </div>
              )}
            </div>

            {/* Scanning State */}
            {isScanning && (
              <div className="text-center py-6 border rounded-lg bg-muted/30">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  Scanning receipt...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Extracting text and analyzing data
                </p>
              </div>
            )}

            {/* Parse Results */}
            {parseResult && !isScanning && (
              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">
                      Receipt Processed Successfully
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(parseResult.receiptData.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-800">Merchant:</span>
                      <span className="font-medium text-green-900">
                        {parseResult.receiptData.merchantName || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-800">Amount:</span>
                      <span className="font-medium text-green-900">
                        ${parseResult.receiptData.extractedAmount?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-800">Category:</span>
                      <span className="font-medium text-green-900">
                        {getCategoryById(parseResult.suggestedExpense.category).name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Suggested Expense */}
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Suggested Expense:</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Description:</strong> {parseResult.suggestedExpense.description}</div>
                    <div><strong>Amount:</strong> ${parseResult.suggestedExpense.amount.toFixed(2)}</div>
                    <div><strong>Category:</strong> {getCategoryById(parseResult.suggestedExpense.category).name}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    className="flex-1"
                  >
                    Try Another
                  </Button>
                  <Button
                    onClick={handleUseReceipt}
                    className="flex-1"
                    disabled={!onReceiptParsed}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Use Receipt Data
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Tips for better scanning:</strong></p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Ensure good lighting</li>
            <li>Keep receipt flat and fully visible</li>
            <li>Avoid shadows and glare</li>
            <li>Support for most receipt formats</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
