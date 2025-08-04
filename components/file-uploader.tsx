"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Paperclip, X, FileText, FileImage, FileArchive, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  files: Array<{
    name: string
    type: string
    size: string
    file?: File
    url?: string
  }>
  onFilesChange: (
    files: Array<{
      name: string
      type: string
      size: string
      file?: File
      url?: string
    }>,
  ) => void
  allowedTypes?: string[]
  maxFiles?: number
  maxSize?: number // in MB
  label?: string
  emptyState?: React.ReactNode
}

export function FileUploader({
  files,
  onFilesChange,
  allowedTypes,
  maxFiles = 10,
  maxSize = 50, // 50MB default
  label = "Resources",
  emptyState,
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    processFiles(Array.from(selectedFiles))

    // Reset input value so the same file can be uploaded again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files))
    }
  }

  const processFiles = (newFiles: File[]) => {
    // Check if adding these files would exceed the max files limit
    if (files.length + newFiles.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} files.`)
      return
    }

    const processedFiles = newFiles
      .filter((file) => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          alert(`File ${file.name} exceeds the maximum size of ${maxSize}MB.`)
          return false
        }

        // Check file type if allowedTypes is provided
        if (allowedTypes && allowedTypes.length > 0) {
          const fileExt = file.name.split(".").pop()?.toLowerCase() || ""
          if (!allowedTypes.includes(fileExt)) {
            alert(`File type .${fileExt} is not allowed. Allowed types: ${allowedTypes.join(", ")}`)
            return false
          }
        }

        return true
      })
      .map((file) => ({
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size),
        file,
      }))

    onFilesChange([...files, ...processedFiles])
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    onFilesChange(newFiles)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || ""

    switch (extension) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "xls":
      case "xlsx":
        return <FileText className="h-4 w-4 text-green-500" />
      case "ppt":
      case "pptx":
        return <FileText className="h-4 w-4 text-orange-500" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage className="h-4 w-4 text-purple-500" />
      case "zip":
      case "rar":
        return <FileArchive className="h-4 w-4 text-gray-500" />
      case "js":
      case "ts":
      case "py":
      case "java":
      case "html":
      case "css":
        return <FileCode className="h-4 w-4 text-teal-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const defaultEmptyState = (
    <div className="border border-dashed rounded-md p-6 text-center">
      <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-500">Attach resources like PDFs, documents, or images</p>
      <Button variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>
        Browse Files
      </Button>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-base font-medium">{label}</label>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Paperclip className="mr-2 h-4 w-4" />
          Attach Files
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept={allowedTypes?.map((type) => `.${type}`).join(",")}
        />
      </div>

      {files.length > 0 ? (
        <div className="space-y-2 border rounded-md p-3" onDragEnter={handleDrag}>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
              <div className="flex items-center">
                {getFileIcon(file.name)}
                <span className="ml-2 text-sm">{file.name}</span>
                <span className="ml-2 text-xs text-gray-500">({file.size})</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFile(index)}
                className="text-gray-500 h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`${dragActive ? "border-purple-500 bg-purple-50" : ""}`}
        >
          {emptyState || defaultEmptyState}
        </div>
      )}

      {/* Drag overlay */}
      {dragActive && (
        <div
          className="fixed inset-0 bg-purple-500 bg-opacity-10 z-50 flex items-center justify-center"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Paperclip className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Drop files here</h3>
          </div>
        </div>
      )}
    </div>
  )
}
