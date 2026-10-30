'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/atoms/card';
import { Button } from '@/components/atoms/button';
import { Alert } from '@/components/molecules/alert';
import { DynamicFormField } from '@/components/molecules/dynamic-form-field';
import {
  buildFormObject,
  syncObjectForm,
  defaultFormSchema,
  type DynamicFormSchema,
  type FormFieldSchema,
  type FormValues,
  type FormErrors,
} from './types';

export interface DynamicFormProps {
  schema?: DynamicFormSchema;
  initialValues?: FormValues;
  onSubmit?: (values: FormValues) => void | Promise<void>;
  onChange?: (values: FormValues) => void;
  disabled?: boolean;
  className?: string;
  showCardWrapper?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  schema = defaultFormSchema,
  initialValues = {},
  onSubmit,
  onChange,
  disabled = false,
  className = '',
  showCardWrapper = true,
}) => {
  const getFieldKey = (field: FormFieldSchema) => field.name || field.id;

  // Inicializacion de valores en base a los names del esquema
  const [values, setValues] = useState<FormValues>(() => {
    const baseObject = buildFormObject(schema);
    const merged: FormValues = {
      ...baseObject,
      ...initialValues,
    };
    syncObjectForm(merged, schema.id);
    return merged;
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Ordenamiento reactivo por la propiedad 'order' (entero)
  const sortedFields = useMemo(() => {
    return [...schema.fields].sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });
  }, [schema.fields]);

  // Validacion de un campo individual
  const validateField = useCallback(
    (field: FormFieldSchema, val: unknown, allValues: FormValues): string | undefined => {
      const v = field.validation;
      const effectiveMaxLength = field.maxLength ?? v?.maxLength;
      if (!v && effectiveMaxLength === undefined) return undefined;

      // Validacion de Requerido
      if (v?.required) {
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

      // Si el campo esta vacio y no es requerido, omitir resto de validaciones
      if (val === undefined || val === null || val === '') {
        return undefined;
      }

      // Validaciones para 'number'
      if (field.type === 'number') {
        const numVal = Number(val);
        if (isNaN(numVal)) {
          return 'Debe ser un número válido.';
        }
        if (v?.min !== undefined && numVal < v.min) {
          return `El valor mínimo permitido es ${v.min}.`;
        }
        if (v?.max !== undefined && numVal > v.max) {
          return `El valor máximo permitido es ${v.max}.`;
        }
      }

      // Validaciones de longitud para texto / textarea
      if (typeof val === 'string') {
        if (v?.minLength !== undefined && val.length < v.minLength) {
          return `Debe contener al menos ${v.minLength} caracteres.`;
        }
        if (effectiveMaxLength !== undefined && val.length > effectiveMaxLength) {
          return `No puede superar los ${effectiveMaxLength} caracteres.`;
        }
        if (v?.pattern) {
          const regex =
            typeof v.pattern === 'string' ? new RegExp(v.pattern) : v.pattern;
          if (!regex.test(val)) {
            return v.patternMessage ?? 'El formato ingresado no es válido.';
          }
        }
      }

      // Validacion de tamano para archivo
      if (field.type === 'file' && (v?.maxSizeMb || field.maxSizeMb)) {
        const limitMb = v?.maxSizeMb ?? field.maxSizeMb!;
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
      if (v?.customValidator) {
        return v.customValidator(val, allValues);
      }

      return undefined;
    },
    []
  );

  const handleFieldChange = (field: FormFieldSchema, value: unknown) => {
    const key = getFieldKey(field);
    const updated = { ...values, [key]: value };
    setValues(updated);
    syncObjectForm(updated, schema.id);

    // Limpiar error del campo si ya cumple
    if (errors[key]) {
      const err = validateField(field, value, updated);
      setErrors((prev) => ({ ...prev, [key]: err }));
    }

    if (onChange) {
      onChange(updated);
    }
  };

  const handleFieldBlur = (field: FormFieldSchema) => {
    const key = getFieldKey(field);
    const error = validateField(field, values[key], values);
    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(null);

    // Validar todos los campos
    const newErrors: FormErrors = {};
    let hasErrors = false;

    for (const field of schema.fields) {
      const key = getFieldKey(field);
      const error = validateField(field, values[key], values);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    }

    setErrors(newErrors);

    if (hasErrors) {
      return;
    }

    const currentObjectForm = syncObjectForm(values, schema.id);

    if (onSubmit) {
      try {
        setIsSubmitting(true);
        await onSubmit(currentObjectForm);
        setSubmitSuccess('Formulario enviado y procesado con éxito.');
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
    const defaults = buildFormObject(schema);
    setValues(defaults);
    syncObjectForm(defaults, schema.id);
    setErrors({});
    setSubmitSuccess(null);
    if (onChange) {
      onChange(defaults);
    }
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
        <div className="border-b border-black pb-4">
          {schema.title && (
            <h3 className="text-lg font-bold text-black">
              {schema.title}
            </h3>
          )}
          {schema.description && (
            <p className="text-xs text-black mt-1">
              {schema.description}
            </p>
          )}
        </div>
      )}

      {/* Alerta de Error global del formulario */}
      {errors._form && (
        <Alert variant="error" title="Error en el formulario" description={errors._form} />
      )}

      {/* Alerta de Exito */}
      {submitSuccess && (
        <Alert variant="success" title="Completado" description={submitSuccess} />
      )}

      {/* Cuadricula dinamica ordenada por 'order' */}
      <div className={`grid gap-5 ${getGridColsClass()}`}>
        {sortedFields.map((field) => {
          const key = getFieldKey(field);
          return (
            <div key={field.id} className={getColSpanClass(field.colSpan)}>
              <DynamicFormField
                field={field}
                value={values[key]}
                error={errors[key]}
                disabled={disabled || isSubmitting}
                onChange={(newVal) => handleFieldChange(field, newVal)}
                onBlur={() => handleFieldBlur(field)}
              />
            </div>
          );
        })}
      </div>

      {/* Barra de Acciones */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-black">
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
