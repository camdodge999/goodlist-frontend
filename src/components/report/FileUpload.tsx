import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faFileCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { z } from "zod";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  validationError?: string;
  fileSchema: z.ZodType<File>;
  label?: string;
  description?: string;
  accept?: string;
  maxSize?: number;
}

export default function FileUpload({
  onFileChange,
  validationError,
  fileSchema,
  label = "อัพโหลดไฟล์",
  description = "PNG, JPG, PDF ขนาดไม่เกิน 10MB",
  accept = "image/png,image/jpeg,application/pdf",
  maxSize = 10 * 1024 * 1024 // 10MB default
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    try {
      fileSchema.parse(file);
      
      // Additional validation
      if (file.size > maxSize) {
        setError(`ไฟล์ขนาดใหญ่เกินไป (สูงสุด ${maxSize / (1024 * 1024)}MB)`);
        return false;
      }
      
      // Check file type
      const acceptedTypes = accept.split(',');
      if (!acceptedTypes.includes(file.type)) {
        setError(`ประเภทไฟล์ไม่ถูกต้อง (รองรับเฉพาะ ${accept})`);
        return false;
      }
      
      setError(null);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("ไฟล์ไม่ถูกต้อง");
      }
      return false;
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setFile(null);
      setPreview(null);
      onFileChange(null);
      return;
    }

    if (validateFile(file)) {
      setFile(file);
      onFileChange(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, just show the file name
        setPreview(null);
      }
    } else {
      setFile(null);
      setPreview(null);
      onFileChange(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileChange(selectedFile);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  }, []);

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    onFileChange(null);
  };

  return (
    <div>
      {!file ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer",
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
            (validationError || error) && "border-red-300 bg-red-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FontAwesomeIcon 
            icon={faCloudArrowUp} 
            className={cn(
              "w-10 h-10 mb-3", 
              isDragging ? "text-blue-500" : "text-gray-400",
              (validationError || error) && "text-red-400"
            )} 
          />
          <div className="text-center">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-gray-500 mt-1">
              {description}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ลากไฟล์มาวางที่นี่ หรือ
            </p>
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                เลือกไฟล์
              </Button>
              <input
                title="file-upload"
                placeholder="file-upload"
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept={accept}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faFileCircleCheck} className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm font-medium">{file.name}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveFile}
              className="text-gray-400 hover:text-red-500 border-none hover:bg-transparent"
            >
              <FontAwesomeIcon icon={faCircleXmark} className="w-4 h-4 text-lg" />
            </Button>
          </div>
          
          {preview && (
            <div className="mt-2 relative w-full h-40 bg-gray-100 rounded overflow-hidden">
              <Image
                src={preview}
                alt="File preview"
                fill
                className="object-contain"
              />
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      )}

      {(validationError || error) && (
        <p className="mt-1 text-sm text-red-600">{validationError || error}</p>
      )}
    </div>
  );
} 