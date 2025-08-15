"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/UserContext"
import { createClient } from "@/lib/supabase/client"

interface Props {
  initialPhoto?: string | null
}

// Simple center-square cropper without external deps.
// On save, it crops to a square centered area with adjustable zoom.
export default function ProfileEditor({ initialPhoto }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [preview, setPreview] = useState<string | null>(initialPhoto || null)
  const [zoom, setZoom] = useState<number>(1)
  const [saving, setSaving] = useState(false)
  const { fetchUserProfile } = useUser()
  const supabase = createClient()

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const cropAndUpload = async () => {
    try {
      if (!preview) {
        toast({ title: "No image selected", variant: "destructive" })
        return
      }
      setSaving(true)

      // Draw to canvas with center square crop and zoom
      const img = new Image()
      img.src = preview
      await new Promise<void>((res, rej) => {
        img.onload = () => res()
        img.onerror = () => rej(new Error("Image load error"))
      })

      const size = 512 // final square size
      const canvas = canvasRef.current || document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")!

      const baseW = img.width
      const baseH = img.height
      const scale = Math.max(size / baseW, size / baseH) * zoom
      const drawW = baseW * scale
      const drawH = baseH * scale
      const dx = (size - drawW) / 2
      const dy = (size - drawH) / 2

      ctx.clearRect(0, 0, size, size)
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, dx, dy, drawW, drawH)

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9)

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: dataUrl }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Upload failed")
      toast({ title: "Profile photo updated" })
      setPreview(json.photoUrl || dataUrl)

      // Refresh shared profile so header avatar updates
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await fetchUserProfile(user)
      }
    } catch (e: any) {
      toast({ title: "Could not update photo", description: e.message || "Try again", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200">
          {preview ? (
            <img src={preview} alt="preview" className="h-full w-full object-cover" ref={imgRef} />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">No photo</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Choose Image</Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">Zoom</label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={cropAndUpload} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
