'use client';

import React, { useRef, useState, type InputHTMLAttributes } from 'react';

export interface FileInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  isError?: boolean;
  value?: File | File[] | null;
  onChange?: (files: File | File[] | null) => void;
  maxSizeMb?: number;
  hint?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
  className = '',
  isError = false,
  disabled = false,
  multiple = false,
  accept,
  value,
  onChange,
  maxSizeMb,
  hint,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  });

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);
    const updated = multiple ? [...selectedFiles, ...filesArray] : [filesArray[0]];

    setSelectedFiles(updated);
    if (onChange) {
      onChange(multiple ? updated : updated[0] ?? null);
    }
  };

  const handleRemove = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    if (onChange) {
      onChange(multiple ? updated : updated[0] ?? null);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={`group relative flex flex-col items-center justify-center p-6 border border-dashed rounded-[15px] bg-white cursor-pointer transition-colors ${disabled
          ? 'opacity-40 cursor-not-allowed border-black'
          : isError
            ? 'border-status-error'
            : isDragging
              ? 'border-solid border-black'
              : 'border-black hover:border-solid bg-gradient-to-r from-zinc-50 to-gray-100'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden "
          {...props}
        />

        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="w-10 h-10 rounded-[15px] border border-black bg-white flex items-center justify-center text-black mb-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-black">
            <span className="underline">
              Haz clic para subir
            </span>{' '}
            o arrastra archivos aquí
          </p>
          <p className="text-xs text-black">
            {hint ??
              `${accept ? `Formatos: ${accept}` : 'Cualquier archivo'} ${maxSizeMb ? `(Máx. ${maxSizeMb} MB)` : ''
              }`}
          </p>
        </div>
      </div>

      {/* Lista de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          {selectedFiles.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between px-3 py-2 rounded-[15px] bg-white border border-black text-xs text-black"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <svg
                  className="w-4 h-4 text-black shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="font-medium text-black truncate">
                  {file.name}
                </span>
                <span className="text-black text-[10px]">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => handleRemove(idx, e)}
                disabled={disabled}
                className="text-black hover:text-status-error transition-colors p-1 cursor-pointer"
                title="Eliminar archivo"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
