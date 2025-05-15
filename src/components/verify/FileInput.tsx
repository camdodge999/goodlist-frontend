import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFileAlt, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FormMessage } from "@/components/ui/form-message";
import { Button } from "../ui/button";

interface FileInputProps {
  id: string;
  label: string;
  description: string;
  acceptTypes: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileRef: React.RefObject<HTMLInputElement>;
  selectedFile: File | null;
  error?: string;
}

export default function FileInput({
  id,
  label,
  description,
  acceptTypes,
  onChange,
  fileRef,
  selectedFile,
  error
}: FileInputProps) {
  const [hover, setHover] = useState(false);

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between mb-2">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <span className="text-xs text-gray-500">{description}</span>
      </div>

      <div
        className={`relative border ${
          error 
            ? "border-destructive bg-destructive/5" 
            : hover 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 bg-gray-50"
        } rounded-lg p-4 transition-colors duration-200`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <input
          type="file"
          id={id}
          ref={fileRef}
          className="sr-only"
          onChange={onChange}
          accept={acceptTypes}
        />

        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faFileAlt}
                className="h-5 w-5 text-blue-500 mr-2"
              />
              <span className="text-sm text-gray-800 truncate max-w-xs">
                {selectedFile.name}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                ({Math.round(selectedFile.size / 1024)} KB)
              </span>
            </div>
            <Button
              type="button"
              title="ลบไฟล์"
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.value = "";
                  onChange({ target: { files: null } } as React.ChangeEvent<HTMLInputElement>);
                }
              }}
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <FontAwesomeIcon icon={faTimesCircle} className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label
            htmlFor={id}
            className="flex flex-col items-center justify-center cursor-pointer py-4"
          >
            <FontAwesomeIcon
              icon={faUpload}
              className={`h-8 w-8 mb-2 ${error ? "text-destructive" : "text-blue-500"}`}
            />
            <span className={`text-sm ${error ? "text-destructive" : "text-gray-700"}`}>
              คลิกเพื่ออัพโหลดไฟล์
            </span>
          </label>
        )}
      </div>
      
      {error && <FormMessage variant="error">{error}</FormMessage>}
    </div>
  );
} 