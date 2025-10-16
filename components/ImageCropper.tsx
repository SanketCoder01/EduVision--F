"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Camera, Upload, ZoomIn, ZoomOut, RotateCw, Save, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ImageCropperProps {
  open: boolean
  onClose: () => void
  onSave: (croppedImage: string) => void
  currentImage?: string
}

export default function ImageCropper({ open, onClose, onSave, currentImage }: ImageCropperProps) {
  const [image, setImage] = useState<string | null>(currentImage || null)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [captureMethod, setCaptureMethod] = useState<'upload' | 'camera'>('upload')
  const [isCameraActive, setIsCameraActive] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setScale(1)
        setRotation(0)
        setPosition({ x: 0, y: 0 })
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
        toast({ title: "Camera Started", description: "Position your face and capture" })
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please use upload instead.",
        variant: "destructive"
      })
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      
      if (context) {
        context.save()
        context.scale(-1, 1)
        context.translate(-canvas.width, 0)
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        context.restore()
        
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        setImage(imageData)
        stopCamera()
        setScale(1)
        setRotation(0)
        setPosition({ x: 0, y: 0 })
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (image) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const getCroppedImage = useCallback(() => {
    if (!image || !canvasRef.current || !imageRef.current) return null

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Set canvas size to desired output (400x400 for profile picture)
    const outputSize = 400
    canvas.width = outputSize
    canvas.height = outputSize

    // Calculate the crop area
    const cropSize = 300 // Size of the circular crop area in the preview
    const scaleRatio = outputSize / cropSize

    ctx.save()
    ctx.clearRect(0, 0, outputSize, outputSize)
    
    // Create circular clipping path
    ctx.beginPath()
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    // Calculate source dimensions
    const img = imageRef.current
    const sourceX = (cropSize / 2 - position.x) / scale
    const sourceY = (cropSize / 2 - position.y) / scale
    const sourceWidth = cropSize / scale
    const sourceHeight = cropSize / scale

    // Draw the rotated and scaled image
    ctx.translate(outputSize / 2, outputSize / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(1, 1)
    ctx.drawImage(
      img,
      -outputSize / 2,
      -outputSize / 2,
      outputSize,
      outputSize
    )
    ctx.restore()

    return canvas.toDataURL('image/jpeg', 0.95)
  }, [image, scale, rotation, position])

  const handleSave = () => {
    const croppedImage = getCroppedImage()
    if (croppedImage) {
      onSave(croppedImage)
      handleClose()
      toast({ title: "Success", description: "Profile picture updated successfully!" })
    }
  }

  const handleClose = () => {
    stopCamera()
    setImage(null)
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Method Selection */}
          {!image && (
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => { setCaptureMethod('upload'); fileInputRef.current?.click() }}
                variant={captureMethod === 'upload' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </Button>
              <Button
                onClick={() => { setCaptureMethod('camera'); startCamera() }}
                variant={captureMethod === 'camera' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </Button>
            </div>
          )}

          {/* Camera View */}
          {isCameraActive && !image && (
            <div className="relative w-full h-80 bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
                <Button onClick={stopCamera} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Image Editor */}
          {image && !isCameraActive && (
            <>
              <div
                className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={image}
                  alt="Preview"
                  className="absolute"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                    maxWidth: 'none',
                    width: '100%',
                    height: 'auto'
                  }}
                />
                {/* Circular crop overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full">
                    <defs>
                      <mask id="circleMask">
                        <rect width="100%" height="100%" fill="white" opacity="0.7" />
                        <circle cx="50%" cy="50%" r="150" fill="black" />
                      </mask>
                    </defs>
                    <rect width="100%" height="100%" fill="black" mask="url(#circleMask)" opacity="0.5" />
                    <circle cx="50%" cy="50%" r="150" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
                  </svg>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <ZoomOut className="w-4 h-4" />
                  <Slider
                    value={[scale]}
                    onValueChange={(val) => setScale(val[0])}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <ZoomIn className="w-4 h-4" />
                  <span className="text-sm text-gray-600 w-12">{scale.toFixed(1)}x</span>
                </div>

                <div className="flex items-center gap-4">
                  <RotateCw className="w-4 h-4" />
                  <Slider
                    value={[rotation]}
                    onValueChange={(val) => setRotation(val[0])}
                    min={0}
                    max={360}
                    step={15}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">{rotation}°</span>
                </div>

                <Button
                  onClick={() => { setImage(null); setCaptureMethod('upload') }}
                  variant="outline"
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Choose Different Photo
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!image}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>

        {/* Hidden elements */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
