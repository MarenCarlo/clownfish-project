'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/atoms/card';
import { Button } from '@/components/atoms/button';
import { Alert } from '@/components/molecules/alert';
import { DynamicFormField } from '@/components/molecules/dynamic-form-field';
import type {
  DynamicFormSchema,
  FormFieldSchema,
  FormValues,
  FormErrors,
} from './types';

export interface DynamicFormProps {
  schema: DynamicFormSchema;
  initialValues?: FormValues;
  onSubmit?: (values: FormValues) => void | Promise<void>;
  onChange?: (values: FormValues) => void;
  disabled?: boolean;
  className?: string;
  showCardWrapper?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  initialValues = {},
  onSubmit,
  onChange,
  disabled = false,
  className = '',
  showCardWrapper = true,
}) => {
  // Inicialización de valores por defecto desde el esquema
  const [values, setValues] = useState<FormValues>(() => {
    const defaults: FormValues = {};
    schema.fields.forEach((field) => {
      defaults[field.id] =
        initialValues[field.id] ?? field.defaultValue ?? (field.type === 'file' ? null : '');
    });
    return defaults;
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Validación de un campo individual
  const validateField = useCallback(
    (field: FormFieldSchema, val: unknown, allValues: FormValues): string | undefined => {
      const v = field.validation;
      if (!v) return undefined;

      // Validación de Requerido
      if (v.required) {
        const reqMessage =
          typeof v.required === 'string'
            ? v.required
            : `${field.label} es obligatorio.`;

        if (val === undefined || val === null || val === '') {
          return reqMessage;
        }
        if (Array.isArray(val) && val.length === 0) {
          return reqMessage;
        }
      }

      // Si el campo está vacío y no es requerido, omitir resto de validaciones
      if (val === undefined || val === null || val === '') {
        return undefined;
      }

      // Validaciones para 'number'
      if (field.type === 'number') {
        const numVal = Number(val);
        if (isNaN(numVal)) {
          return 'Debe ser un número válido.';
        }
        if (v.min !== undefined && numVal < v.min) {
          return `El valor mínimo permitido es ${v.min}.`;
        }
        if (v.max !== undefined && numVal > v.max) {
          return `El valor máximo permitido es ${v.max}.`;
        }
      }

      // Validaciones de longitud para texto / textarea
      if (typeof val === 'string') {
        if (v.minLength !== undefined && val.length < v.minLength) {
          return `Debe contener al menos ${v.minLength} caracteres.`;
        }
        if (v.maxLength !== undefined && val.length > v.maxLength) {
          return `No puede superar los ${v.maxLength} caracteres.`;
        }
        if (v.pattern) {
          const regex =
            typeof v.pattern === 'string' ? new RegExp(v.pattern) : v.pattern;
          if (!regex.test(val)) {
            return v.patternMessage ?? 'El formato ingresado no es válido.';
          }
        }
      }

      // Validación de tamaño para archivo
      if (field.type === 'file' && (v.maxSizeMb || field.maxSizeMb)) {
        const limitMb = v.maxSizeMb ?? field.maxSizeMb!;
        const limitBytes = limitMb * 1024 * 1024;
        const files: File[] = Array.isArray(val)
          ? (val as File[])
          : val instanceof File
          ? [val]
          : [];

        for (const f of files) {
          if (f.size > limitBytes) {
            return `El archivo "${f.name}" supera el límite de ${limitMb} MB.`;
          }
        }
      }

      // Validador personalizado
      if (v.customValidator) {
        return v.customValidator(val, allValues);
      }

      return undefined;
    },
    []
  );

  const handleFieldChange = (fieldId: string, value: unknown) => {
    const updated = { ...values, [fieldId]: value };
    setValues(updated);

    // Limpiar error del campo si ya cumple
    const field = schema.fields.find((f) => f.id === fieldId);
    if (field && errors[fieldId]) {
      const err = validateField(field, value, updated);
      setErrors((prev) => ({ ...prev, [fieldId]: err }));
    }

    if (onChange) {
      onChange(updated);
    }
  };

  const handleFieldBlur = (fieldId: string) => {
    const field = schema.fields.find((f) => f.id === fieldId);
    if (!field) return;

    const error = validateField(field, values[fieldId], values);
    setErrors((prev) => ({ ...prev, [fieldId]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(null);

    // Validar todos los campos
    const newErrors: FormErrors = {};
    let hasErrors = false;

    for (const field of schema.fields) {
      const error = validateField(field, values[field.id], values);
      if (error) {
        newErrors[field.id] = error;
        hasErrors = true;
      }
    }

    setErrors(newErrors);

    if (hasErrors) {
      return;
    }

    if (onSubmit) {
      try {
        setIsSubmitting(true);
        await onSubmit(values);
        setSubmitSuccess('¡Formulario enviado y procesado con éxito!');
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Ocurrió un error inesperado al procesar el formulario.';
        setErrors((prev) => ({ ...prev, _form: message }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    const defaults: FormValues = {};
    schema.fields.forEach((field) => {
      defaults[field.id] =
        initialValues[field.id] ?? field.defaultValue ?? (field.type === 'file' ? null : '');
    });
    setValues(defaults);
    setErrors({});
    setSubmitSuccess(null);
  };

  const getColSpanClass = (colSpan?: number) => {
    switch (colSpan) {
      case 2:
        return 'sm:col-span-2';
      case 3:
        return 'sm:col-span-3';
      case 4:
        return 'sm:col-span-4';
      case 6:
        return 'sm:col-span-6';
      case 12:
        return 'col-span-full';
      default:
        return 'col-span-1';
    }
  };

  const getGridColsClass = () => {
    const cols = schema.layout?.columns ?? 1;
    switch (cols) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1';
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Encabezado opcional */}
      {(schema.title || schema.description) && (
        <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
          {schema.title && (
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {schema.title}
            </h3>
          )}
          {schema.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {schema.description}
            </p>
          )}
        </div>
      )}

      {/* Alerta de Error global del formulario */}
      {errors._form && (
        <Alert variant="error" title="Error en el formulario" description={errors._form} />
      )}

      {/* Alerta de Éxito */}
      {submitSuccess && (
        <Alert variant="success" title="Completado" description={submitSuccess} />
      )}

      {/* Cuadrícula dinámica de campos */}
      <div className={`grid gap-5 ${getGridColsClass()}`}>
        {schema.fields.map((field) => (
          <div key={field.id} className={getColSpanClass(field.colSpan)}>
            <DynamicFormField
              field={field}
              value={values[field.id]}
              error={errors[field.id]}
              disabled={disabled || isSubmitting}
              onChange={(newVal) => handleFieldChange(field.id, newVal)}
              onBlur={() => handleFieldBlur(field.id)}
            />
          </div>
        ))}
      </div>

      {/* Barra de Acciones */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        {schema.resetText && (
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={disabled || isSubmitting}
            onClick={handleReset}
          >
            {schema.resetText}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          disabled={disabled || isSubmitting}
        >
          {schema.submitText ?? 'Guardar Formulario'}
        </Button>
      </div>
    </form>
  );

  if (showCardWrapper) {
    return <Card className={className}>{formContent}</Card>;
  }

  return <div className={className}>{formContent}</div>;
};
