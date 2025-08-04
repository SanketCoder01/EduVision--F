"use client"

import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface SuccessScreenProps {
  title: string
  message: string
  backUrl: string
  backLabel: string
}

export function SuccessScreen({ title, message, backUrl, backLabel }: SuccessScreenProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-green-100 p-3 mb-4">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      <Button onClick={() => router.push(backUrl)}>{backLabel}</Button>
    </div>
  )
}
