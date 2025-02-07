"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface ImageUploaderProps {
  onUpload: (file: File) => void
  isProcessing: boolean
}

export default function ImageUploader({ onUpload, isProcessing }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isProcessing} />
      <Button onClick={handleUpload} disabled={!file || isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Upload and Process Bill"
        )}
      </Button>
    </div>
  )
}

