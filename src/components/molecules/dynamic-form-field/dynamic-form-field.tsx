import React from 'react';
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { Select } from '@/components/atoms/select';
import { FileInput } from '@/components/atoms/file-input';
import type { FormFieldSchema } from '@/components/organisms/dynamic-form/types';

export interface DynamicFormFieldProps {
  field: FormFieldSchema;
  value: unknown;
  error?: string;
  disabled?: boolean;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  error,
  disabled = false,
  onChange,
  onBlur,
}) => {
  const isRequired = Boolean(field.validation?.required);
  const isDisabled = disabled || field.disabled;
  const isError = Boolean(error);
  const fieldId = field.id;

  const renderControl = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'tel':
      case 'url':
        return (
          <Input
            id={fieldId}
            name={field.name ?? field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={typeof value === 'string' || typeof value === 'number' ? value : ''}
            disabled={isDisabled}
            readOnly={field.readOnly}
            isError={isError}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
        );

      case 'number':
        return (
          <Input
            id={fieldId}
            name={field.name ?? field.id}
            type="number"
            step={field.step}
            min={field.validation?.min}
            max={field.validation?.max}
            placeholder={field.placeholder}
            value={value !== undefined && value !== null ? String(value) : ''}
            disabled={isDisabled}
            readOnly={field.readOnly}
            isError={isError}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val === '' ? '' : Number(val));
            }}
            onBlur={onBlur}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            name={field.name ?? field.id}
            rows={field.rows ?? 4}
            placeholder={field.placeholder}
            value={typeof value === 'string' ? value : ''}
            disabled={isDisabled}
            readOnly={field.readOnly}
            isError={isError}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
        );

      case 'select':
        return (
          <Select
            id={fieldId}
            name={field.name ?? field.id}
            options={field.options}
            placeholder={field.placeholder ?? 'Selecciona una opción...'}
            value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
            disabled={isDisabled}
            isError={isError}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
        );

      case 'file':
        return (
          <FileInput
            id={fieldId}
            name={field.name ?? field.id}
            accept={field.accept}
            multiple={field.multiple}
            maxSizeMb={field.maxSizeMb ?? field.validation?.maxSizeMb}
            value={(value as File | File[] | null) ?? null}
            disabled={isDisabled}
            isError={isError}
            onChange={(files) => onChange(files)}
            hint={field.helperText}
          />
        );

      default:
        return (
          <div className="text-xs text-status-error">
            Tipo de campo no soportado: {(field as { type: string }).type}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-black flex items-center gap-1"
        >
          {field.label}
          {isRequired && <span className="text-status-error font-bold">*</span>}
        </label>
      </div>

      {renderControl()}

      {error ? (
        <span className="text-xs text-status-error font-medium flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </span>
      ) : field.type !== 'file' && field.helperText ? (
        <span className="text-xs text-black">
          {field.helperText}
        </span>
      ) : null}
    </div>
  );
};
