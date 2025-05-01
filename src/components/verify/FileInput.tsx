import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FileInputProps } from '@/types/verify';

const FileInput: React.FC<FileInputProps> = ({
  id,
  label,
  description,
  acceptTypes,
  onChange,
  fileRef,
  selectedFile
}) => {
  return (
    <div className="mt-4">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {selectedFile && <span className="text-green-600">✓</span>}
      </label>
      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
          selectedFile 
            ? "border-green-300 bg-green-50" 
            : "border-gray-300 hover:border-blue-500"
        } transition-colors duration-200`}
      >
        <div className="space-y-1 text-center">
          {selectedFile ? (
            <FontAwesomeIcon 
              icon={faCheckCircle} 
              className="mx-auto h-12 w-12 text-green-500" 
            />
          ) : (
            <FontAwesomeIcon 
              icon={faCloudUploadAlt} 
              className="mx-auto h-12 w-12 text-gray-400" 
            />
          )}
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor={id}
              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <span>อัพโหลดไฟล์</span>
              <input
                id={id}
                name={id}
                type="file"
                className="sr-only"
                accept={acceptTypes}
                onChange={onChange}
                ref={fileRef}
              />
            </label>
            <p className="pl-1">หรือลากไฟล์มาวาง</p>
          </div>
          <p className="text-xs text-gray-500">{description}</p>
          {selectedFile && (
            <p className="text-xs text-green-600 mt-1">
              เลือกไฟล์: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileInput; 