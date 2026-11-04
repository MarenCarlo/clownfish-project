'use client';

import React, { useState } from 'react';
import {
  Input,
  Textarea,
  Select,
  FileInput,
  Checkbox,
} from '@/components/atoms/dynamic-forms';
import type { FormFieldSchema, CheckboxOption } from '@/components/organisms/dynamic-form/types';

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
  const [showPassword, setShowPassword] = useState(false);

  const isRequired = Boolean(field.validation?.required);
  const isDisabled = disabled || field.disabled;
  const isError = Boolean(error);
  const fieldId = field.id;
  const fieldName = field.name || field.id;
  const maxLength = field.maxLength ?? field.validation?.maxLength;

  const isIdentifierField =
    field.type === 'email' ||
    field.type === 'url' ||
    field.type === 'password' ||
    field.autoComplete === 'username';

  const serializedLabelValue =
    value instanceof File
      ? value.name
      : Array.isArray(value)
        ? value.map((item) => (item instanceof File ? item.name : String(item))).join(',')
        : value !== undefined && value !== null
          ? String(value)
          : '';

  const renderControl = () => {
    switch (field.type) {
      case 'password':
        return (
          <div className="relative w-full">
            <Input
              id={fieldId}
              name={fieldName}
              type={showPassword ? 'text' : 'password'}
              placeholder={field.placeholder}
              value={typeof value === 'string' || typeof value === 'number' ? value : ''}
              autoComplete={field.autoComplete ?? 'current-password'}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              required={isRequired}
              disabled={isDisabled}
              readOnly={field.readOnly}
              isError={isError}
              className="pr-10"
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isDisabled}
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-black hover:opacity-70 disabled:opacity-40 cursor-pointer"
            >
              {showPassword ? (
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
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        );

      case 'text':
      case 'email':
      case 'tel':
      case 'url':
        return (
          <Input
            id={fieldId}
            name={fieldName}
            type={field.type}
            maxLength={maxLength}
            placeholder={field.placeholder}
            value={typeof value === 'string' || typeof value === 'number' ? value : ''}
            autoComplete={field.autoComplete}
            spellCheck={isIdentifierField ? false : undefined}
            autoCorrect={isIdentifierField ? 'off' : undefined}
            autoCapitalize={isIdentifierField ? 'off' : undefined}
            required={isRequired}
            disabled={isDisabled}
            readOnly={field.readOnly}
            isError={isError}
            onChange={(e) => {
              const nextVal =
                maxLength !== undefined
                  ? e.target.value.slice(0, maxLength)
                  : e.target.value;
              onChange(nextVal);
            }}
            onBlur={onBlur}
          />
        );

      case 'number':
        return (
          <Input
            id={fieldId}
            name={fieldName}
            type="text"
            inputMode="decimal"
            step={field.step}
            min={field.validation?.min}
            max={field.validation?.max}
            placeholder={field.placeholder}
            value={value !== undefined && value !== null ? String(value) : ''}
            autoComplete={field.autoComplete}
            required={isRequired}
            disabled={isDisabled}
            readOnly={field.readOnly}
            isError={isError}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            onBlur={onBlur}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            name={fieldName}
            rows={field.rows ?? 4}
            maxLength={maxLength}
            placeholder={field.placeholder}
            value={typeof value === 'string' ? value : ''}
            required={isRequired}
            disabled={isDisabled}
            readOnly={field.readOnly}
            isError={isError}
            onChange={(e) => {
              const nextVal =
                maxLength !== undefined
                  ? e.target.value.slice(0, maxLength)
                  : e.target.value;
              onChange(nextVal);
            }}
            onBlur={onBlur}
          />
        );

      case 'select':
        return (
          <Select
            id={fieldId}
            name={fieldName}
            options={field.options}
            placeholder={field.placeholder ?? 'Selecciona una opción...'}
            value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
            required={isRequired}
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
            name={fieldName}
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

      case 'checkbox': {
        const hasOptions = Array.isArray(field.options) && field.options.length > 0;

        // Caso 1: Checkbox individual (boolean: true/false, ej. Términos o interruptor)
        if (!hasOptions) {
          const isChecked = Boolean(value);
          return (
            <div className="pt-1">
              <Checkbox
                id={fieldId}
                name={fieldName}
                checked={isChecked}
                disabled={isDisabled}
                isError={isError}
                label={field.checkboxText || field.label}
                description={field.helperText}
                onChange={(checked) => onChange(checked)}
              />
            </div>
          );
        }

        // Caso 2: Grupo de Checkboxes (selección única tipo radio o selección variada/múltiple)
        const isSingleMode = field.selectionMode === 'single';
        const isHorizontal = field.groupDirection === 'horizontal';

        const handleOptionToggle = (optVal: string | number) => {
          const stringVal = String(optVal);
          if (isSingleMode) {
            // Selección única: si ya está seleccionado, desmarca; sino, selecciona únicamente este
            const current = value !== undefined && value !== null ? String(value) : '';
            onChange(current === stringVal ? '' : stringVal);
          } else {
            // Selección variada (múltiple array)
            const currentArray: (string | number)[] = Array.isArray(value) ? [...value] : [];
            const strArray = currentArray.map(String);
            const exists = strArray.includes(stringVal);
            let nextArray: (string | number)[];
            if (exists) {
              nextArray = currentArray.filter((item) => String(item) !== stringVal);
            } else {
              // Validar maxSelect antes de agregar si está definido
              if (
                field.validation?.maxSelect !== undefined &&
                currentArray.length >= field.validation.maxSelect
              ) {
                return;
              }
              nextArray = [...currentArray, optVal];
            }
            onChange(nextArray);
          }
        };

        return (
          <div
            className={`flex ${
              isHorizontal ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2.5'
            } pt-1`}
          >
            {(field.options as CheckboxOption[]).map((opt) => {
              const optId = `${fieldId}_${opt.value}`;
              const isOptionChecked = isSingleMode
                ? String(value) === String(opt.value)
                : Array.isArray(value) && value.map(String).includes(String(opt.value));

              return (
                <Checkbox
                  key={String(opt.value)}
                  id={optId}
                  name={`${fieldName}[]`}
                  checked={isOptionChecked}
                  disabled={isDisabled || opt.disabled}
                  isError={isError}
                  label={opt.label}
                  description={opt.description}
                  onChange={() => handleOptionToggle(opt.value)}
                />
              );
            })}
          </div>
        );
      }

      default:
        return (
          <div className="text-xs text-status-error">
            Tipo de campo no soportado: {(field as { type: string }).type}
          </div>
        );
    }
  };

  const isSingleStandaloneCheckbox =
    field.type === 'checkbox' && (!field.options || field.options.length === 0);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {!isSingleStandaloneCheckbox && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={fieldId}
            data-name={fieldName}
            data-value={serializedLabelValue}
            className="text-sm font-medium text-black flex items-center gap-1"
          >
            {field.label}
            {isRequired && <span className="text-red-600 font-bold">*</span>}
          </label>
        </div>
      )}

      {renderControl()}

      {error ? (
        <span className="text-xs text-red-600 font-medium flex items-center gap-1">
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
