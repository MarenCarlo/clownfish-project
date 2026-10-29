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
        className={`group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-800'
            : isError
            ? 'border-red-400 bg-red-50/30 dark:bg-red-950/20 hover:border-red-500'
            : isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
            : 'border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:border-blue-400'
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
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform">
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
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-400/50">
              Haz clic para subir
            </span>{' '}
            o arrastra archivos aquí
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {hint ??
              `${accept ? `Formatos: ${accept}` : 'Cualquier archivo'} ${
                maxSizeMb ? `(Máx. ${maxSizeMb} MB)` : ''
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
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="text-gray-400">📄</span>
                <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {file.name}
                </span>
                <span className="text-gray-400 text-[10px]">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => handleRemove(idx, e)}
                disabled={disabled}
                className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"
                title="Eliminar archivo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
