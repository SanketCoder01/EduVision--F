"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useRouter } from "next/navigation"

import StudentLoginPage from "@/components/StudentLoginPage"
import FacultyLoginPage from "@/components/FacultyLoginPage"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type")

  if (type === "student") {
    return <StudentLoginPage onBack={() => router.push("/")} />
  }

  // Use enhanced auth system for faculty as well
  return <FacultyLoginPage onBack={() => router.push("/")} />

}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
