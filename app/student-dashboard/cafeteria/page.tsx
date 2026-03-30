"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import CafeteriaViewer from "@/components/cafeteria-viewer"

export default function StudentCafeteriaPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.push('/student-dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      <CafeteriaViewer backHref="/student-dashboard" />
    </div>
  )
}
