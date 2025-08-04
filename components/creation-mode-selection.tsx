"use client"

import { FileText, FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CreationModeSelectionProps {
  creationMethod: "manual" | "ai"
  setCreationMethod: (method: "manual" | "ai") => void
  onAISelect: () => void
}

export function CreationModeSelection({ creationMethod, setCreationMethod, onAISelect }: CreationModeSelectionProps) {
  return (
    <div className="flex-1">
      <h2 className="text-lg font-medium mb-4">Assignment Method</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant={creationMethod === "manual" ? "default" : "outline"}
          className={`flex-1 justify-start ${creationMethod === "manual" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
          onClick={() => setCreationMethod("manual")}
        >
          <FileText className="mr-2 h-5 w-5" />
          Create Manually
        </Button>

        <Button
          type="button"
          variant={creationMethod === "ai" ? "default" : "outline"}
          className={`flex-1 justify-start ${creationMethod === "ai" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
          onClick={() => {
            setCreationMethod("ai")
            onAISelect()
          }}
        >
          <FileQuestion className="mr-2 h-5 w-5" />
          Generate with AI
        </Button>
      </div>
    </div>
  )
}
