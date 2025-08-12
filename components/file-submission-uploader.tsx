"use client"

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface FileSubmissionUploaderProps {
  onUpload: (file: File) => void;
  allowedFileTypes?: string[];
  maxFileSize?: number; // in bytes
}

export const FileSubmissionUploader: React.FC<FileSubmissionUploaderProps> = ({ 
  onUpload, 
  allowedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxFileSize = 5 * 1024 * 1024 // 5MB
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const firstError = rejectedFiles[0].errors[0];
      if (firstError.code === 'file-too-large') {
        setError(`File is too large. Max size is ${maxFileSize / 1024 / 1024}MB.`);
      } else if (firstError.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a valid document.');
      } else {
        setError(firstError.message);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, [allowedFileTypes, maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    multiple: false,
  });

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
      toast({ title: 'Success', description: 'Your assignment has been submitted.' });
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2 text-gray-500 dark:text-gray-400">
            <UploadCloud className="w-12 h-12" />
            {isDragActive ? (
                <p>Drop the file here ...</p>
            ) : (
                <p>Drag & drop your file here, or click to select</p>
            )}
            <p className="text-xs">Supported types: PDF, DOC, DOCX (Max 5MB)</p>
        </div>
      </div>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
      {file && (
        <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileIcon className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
          <button onClick={handleRemoveFile} className="text-gray-500 hover:text-destructive">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      <Button onClick={handleSubmit} disabled={!file} className="w-full">
        Submit Assignment
      </Button>
    </div>
  );
};
