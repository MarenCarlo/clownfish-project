'use client';

import React, { useRef, useState, useEffect, useMemo, type InputHTMLAttributes } from 'react';

export interface FileInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  isError?: boolean;
  value?: File | File[] | null;
  onChange?: (files: File | File[] | null) => void;
  maxSizeMb?: number;
  hint?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FilePreviewItemProps {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}

const FilePreviewItem: React.FC<FilePreviewItemProps> = ({ file, onRemove, disabled }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const isImage =
      file.type?.startsWith('image/') ||
      /\.(jpe?g|png|webp|gif|svg|bmp|avif)$/i.test(file.name);

    if (!isImage || typeof window === 'undefined') {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (isMounted && typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);

    return () => {
      isMounted = false;
    };
  }, [file]);

  const isImage = Boolean(previewUrl);

  return (
    <div className="flex flex-col gap-2">
      {/* Fila del archivo seleccionado */}
      <div className="flex items-center justify-between p-2 rounded-[15px] bg-white border border-black text-xs text-black">
        <div className="flex items-center gap-3 truncate pr-2">
          {isImage ? (
            <div className="w-10 h-10 rounded-[10px] overflow-hidden border border-black shrink-0 bg-zinc-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl!}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-[10px] border border-black shrink-0 bg-zinc-100 flex items-center justify-center text-black">
              <svg
                className="w-5 h-5 text-black"
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
            </div>
          )}
          <div className="flex flex-col truncate">
            <span className="font-semibold text-black truncate text-sm">
              {file.name}
            </span>
            <span className="text-neutral-600 text-[11px]">
              {formatFileSize(file.size)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="text-black hover:text-[#dc2626] transition-colors p-2 rounded-lg hover:bg-neutral-100 cursor-pointer"
          title="Eliminar archivo"
          aria-label="Eliminar archivo"
        >
          <svg
            className="w-4 h-4"
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

      {/* Vista previa ampliada de la fotografía */}
      {isImage && (
        <div className="relative rounded-[15px] border border-black bg-zinc-50 p-3 overflow-hidden flex flex-col items-center justify-center">
          <div className="w-full max-h-72 overflow-hidden rounded-[10px] flex items-center justify-center bg-white border border-neutral-200 p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl!}
              alt={`Vista previa de ${file.name}`}
              className="max-h-72 w-auto max-w-full object-contain rounded-[8px]"
            />
          </div>
          <div className="w-full flex items-center justify-between pt-2 px-1 text-[11px] text-neutral-600">
            <span className="font-medium text-black flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Vista previa de la fotografía seleccionada
            </span>
            <span className="font-mono text-[10px]">{formatFileSize(file.size)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

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

  // Derivación de archivos actuales directamente del prop 'value'
  const selectedFiles = useMemo<File[]>(() => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter((f): f is File => f instanceof File);
    }
    if (value instanceof File) {
      return [value];
    }
    return [];
  }, [value]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);
    const updated = multiple ? [...selectedFiles, ...filesArray] : [filesArray[0]];

    if (onChange) {
      onChange(multiple ? updated : updated[0] ?? null);
    }
  };

  const handleRemove = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    if (onChange) {
      onChange(multiple ? updated : updated[0] ?? null);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
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
          className="hidden"
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

      {/* Lista de archivos seleccionados y vista previa */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-col gap-3 mt-1">
          {selectedFiles.map((file, idx) => (
            <FilePreviewItem
              key={`${file.name}-${idx}-${file.lastModified}`}
              file={file}
              disabled={disabled}
              onRemove={() => handleRemove(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
