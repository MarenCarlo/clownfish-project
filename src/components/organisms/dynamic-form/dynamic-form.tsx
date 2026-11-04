'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Card } from '@/components/atoms/card';
import { Button } from '@/components/atoms/button';
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
      if (!v && effectiveMaxLength === undefined && field.type !== 'number') {
        return undefined;
      }

      // Validacion de Requerido
      if (v?.required) {
        const reqMessage =
          typeof v.required === 'string'
            ? v.required
            : `${field.label} es obligatorio.`;

        if (field.type === 'checkbox') {
          if (field.options && field.options.length > 0) {
            if (Array.isArray(val) && val.length === 0) {
              return reqMessage;
            }
            if (!Array.isArray(val) && (val === undefined || val === null || String(val).trim() === '')) {
              return reqMessage;
            }
          } else if (!val) {
            return reqMessage;
          }
        } else {
          if (val === undefined || val === null || String(val).trim() === '') {
            return reqMessage;
          }
          if (Array.isArray(val) && val.length === 0) {
            return reqMessage;
          }
        }
      }

      // Si el campo esta vacio y no es requerido, omitir resto de validaciones
      if (
        (val === undefined || val === null || String(val).trim() === '' || val === false) &&
        (!Array.isArray(val) || val.length === 0)
      ) {
        return undefined;
      }

      // Validaciones para 'checkbox' con grupo (minSelect, maxSelect)
      if (field.type === 'checkbox' && Array.isArray(val)) {
        if (v?.minSelect !== undefined && val.length < v.minSelect) {
          return `Debe seleccionar al menos ${v.minSelect} ${v.minSelect === 1 ? 'opción' : 'opciones'}.`;
        }
        if (v?.maxSelect !== undefined && val.length > v.maxSelect) {
          return `No puede seleccionar más de ${v.maxSelect} ${v.maxSelect === 1 ? 'opción' : 'opciones'}.`;
        }
      }

      // Validaciones para 'number'
      if (field.type === 'number') {
        const strVal = String(val).trim();
        const isValidNumberFormat = /^-?\d+(\.\d+)?$/.test(strVal);
        const numVal = Number(strVal);
        if (!isValidNumberFormat || isNaN(numVal)) {
          return 'Debe ingresar un número válido.';
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

    // Validar en tiempo real para campos tipo number o si ya existía un error activo
    if (errors[key] || field.type === 'number') {
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
        toast.success('Formulario enviado y procesado con éxito.');
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Ocurrió un error inesperado al procesar el formulario.';
        toast.error(message);
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
    if (onChange) {
      onChange(defaults);
    }
  };

  const totalColumns = schema.layout?.columns ?? 12;
  const autoDistribute = schema.layout?.autoDistribute ?? true;
  const autoCenterSingle = schema.layout?.autoCenterSingle ?? true;

  interface FormRowItem {
    field: FormFieldSchema;
    colSpan: number;
    colStart?: number;
    isCentered?: boolean;
  }

  // Agrupación dinámica en filas calculando space-between y centrado automático
  const rows = useMemo(() => {
    const rawRows: FormRowItem[][] = [];
    let currentRow: FormRowItem[] = [];
    let currentSpan = 0;

    for (const field of sortedFields) {
      const rawSpan = field.colSpan ?? totalColumns;
      const span = Math.min(Math.max(rawSpan, 1), totalColumns);

      if (currentSpan + span > totalColumns) {
        if (currentRow.length > 0) {
          rawRows.push(currentRow);
        }
        currentRow = [{ field, colSpan: span }];
        currentSpan = span;
      } else {
        currentRow.push({ field, colSpan: span });
        currentSpan += span;
      }
    }

    if (currentRow.length > 0) {
      rawRows.push(currentRow);
    }

    return rawRows.map((row) => {
      const rowItemCount = row.length;
      const totalSpan = row.reduce((acc, item) => acc + item.colSpan, 0);
      const leftoverCols = totalColumns - totalSpan;

      // 1. Caso de un solo elemento en la fila
      if (rowItemCount === 1) {
        const item = row[0];
        const fieldJustify = item.field.justify;

        // Centrado si:
        // - Se pide explícitamente fieldJustify === 'center'
        // - O si autoCenterSingle está activo, no tiene justify: 'start', y:
        //     a) sobran columnas (leftoverCols > 0), O
        //     b) es un control inline/checkbox (incluso si tiene colSpan: 12)
        const shouldCenter =
          fieldJustify === 'center' ||
          (autoCenterSingle &&
            fieldJustify !== 'start' &&
            (leftoverCols > 0 || item.field.type === 'checkbox'));

        if (shouldCenter) {
          const startCol = leftoverCols > 0 ? Math.floor(leftoverCols / 2) + 1 : 1;
          return [
            {
              ...item,
              colStart: startCol,
              isCentered: true,
            },
          ];
        }

        return [
          {
            ...item,
            colStart: 1,
            isCentered: false,
          },
        ];
      }

      // 2. Caso de 2 o más elementos en la fila con columnas faltantes por rellenar -> space-between automático
      if (rowItemCount > 1 && leftoverCols > 0 && autoDistribute) {
        return row.map((item, index) => {
          if (item.field.justify === 'start') {
            return item;
          }

          // Posicionamiento de distribución:
          // Primer elemento al inicio (col-start-1)
          // Último elemento al final (col-start-[totalColumns - span + 1])
          // Elementos intermedios distribuidos equitativamente
          let startCol = 1;
          if (index === 0) {
            startCol = 1;
          } else if (index === rowItemCount - 1) {
            startCol = totalColumns - item.colSpan + 1;
          } else {
            const accumulatedPrevSpan = row
              .slice(0, index)
              .reduce((acc, prev) => acc + prev.colSpan, 0);
            startCol =
              1 +
              accumulatedPrevSpan +
              Math.floor((index * leftoverCols) / (rowItemCount - 1));
          }

          return {
            ...item,
            colStart: startCol,
          };
        });
      }

      // Caso estándar sin distribución especial
      return row;
    });
  }, [sortedFields, totalColumns, autoDistribute, autoCenterSingle]);

  const getColSpanClass = (colSpan?: number) => {
    const rawSpan = colSpan ?? totalColumns;
    const clampedSpan = Math.min(Math.max(rawSpan, 1), totalColumns);

    const colSpanMap: Record<number, string> = {
      1: 'col-span-1 sm:col-span-1',
      2: 'col-span-1 sm:col-span-2',
      3: 'col-span-1 sm:col-span-3',
      4: 'col-span-1 sm:col-span-4',
      5: 'col-span-1 sm:col-span-5',
      6: 'col-span-1 sm:col-span-6',
      7: 'col-span-1 sm:col-span-7',
      8: 'col-span-1 sm:col-span-8',
      9: 'col-span-1 sm:col-span-9',
      10: 'col-span-1 sm:col-span-10',
      11: 'col-span-1 sm:col-span-11',
      12: 'col-span-1 sm:col-span-12',
    };

    return colSpanMap[clampedSpan] ?? 'col-span-1 sm:col-span-12';
  };

  const getColStartClass = (colStart?: number) => {
    if (!colStart) return '';
    const clampedStart = Math.min(Math.max(colStart, 1), 12);
    const colStartMap: Record<number, string> = {
      1: 'sm:col-start-1',
      2: 'sm:col-start-2',
      3: 'sm:col-start-3',
      4: 'sm:col-start-4',
      5: 'sm:col-start-5',
      6: 'sm:col-start-6',
      7: 'sm:col-start-7',
      8: 'sm:col-start-8',
      9: 'sm:col-start-9',
      10: 'sm:col-start-10',
      11: 'sm:col-start-11',
      12: 'sm:col-start-12',
    };
    return colStartMap[clampedStart] ?? '';
  };

  const getGridColsClass = () => {
    const clampedCols = Math.min(Math.max(totalColumns, 1), 12);

    const gridColsMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-6',
      7: 'grid-cols-1 sm:grid-cols-7',
      8: 'grid-cols-1 sm:grid-cols-8',
      9: 'grid-cols-1 sm:grid-cols-9',
      10: 'grid-cols-1 sm:grid-cols-10',
      11: 'grid-cols-1 sm:grid-cols-11',
      12: 'grid-cols-1 sm:grid-cols-12',
    };

    return gridColsMap[clampedCols] ?? 'grid-cols-1 sm:grid-cols-12';
  };

  const getGridGapClass = () => {
    const gap = schema.layout?.gap ?? 'md';
    switch (gap) {
      case 'sm':
        return 'gap-3';
      case 'lg':
        return 'gap-8';
      default:
        return 'gap-5';
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

      {/* Cuadricula dinamica ordenada por 'order' y distribuida en filas inteligentes */}
      <div className={`flex flex-col ${getGridGapClass()}`}>
        {rows.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className={`grid ${getGridGapClass()} ${getGridColsClass()}`}
          >
            {row.map(({ field, colSpan, colStart, isCentered }) => {
              const key = getFieldKey(field);
              return (
                <div
                  key={field.id}
                  className={`${getColSpanClass(colSpan)} ${getColStartClass(colStart)}`}
                >
                  <DynamicFormField
                    field={field}
                    isCentered={isCentered}
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
        ))}
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
