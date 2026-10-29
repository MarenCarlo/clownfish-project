import type { SelectOption } from '@/components/atoms/select';

export type DynamicFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'file'
  | 'select';

export interface FieldValidation {
  required?: boolean | string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string | RegExp;
  patternMessage?: string;
  maxSizeMb?: number;
  customValidator?: (
    value: unknown,
    formData: Record<string, unknown>
  ) => string | undefined;
}

export interface FormFieldSchema {
  id: string;
  order?: number;
  name: string;
  value?: unknown;
  type: DynamicFieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  defaultValue?: unknown;
  disabled?: boolean;
  readOnly?: boolean;
  validation?: FieldValidation;

  // Especifico para select
  options?: SelectOption[];

  // Especifico para file
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;

  // Especifico para number
  step?: number | string;

  // Especifico para textarea
  rows?: number;

  // Espacio de columnas en grid (1 a 12)
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;
}

export interface DynamicFormSchema {
  id: string;
  title?: string;
  description?: string;
  submitText?: string;
  resetText?: string;
  layout?: {
    columns?: 1 | 2 | 3 | 4;
    gap?: 'sm' | 'md' | 'lg';
  };
  fields: FormFieldSchema[];
}

export type FormValues = Record<string, unknown>;
export type FormErrors = Record<string, string | undefined>;

/**
 * Construye dinámicamente el objeto JSON de valores (objectForm)
 * en base a los `name` y `value` definidos en el esquema.
 */
export function buildFormObject(schema: DynamicFormSchema): FormValues {
  return schema.fields.reduce<FormValues>((acc, field) => {
    const key = field.name || field.id;
    acc[key] =
      field.value ??
      field.defaultValue ??
      (field.type === 'file' ? null : '');
    return acc;
  }, {});
}

export const defaultFormSchema: DynamicFormSchema = {
  id: 'main-form',
  layout: {
    columns: 2,
    gap: 'md',
  },
  fields: [
    {
      id: 'input_text',
      order: 1,
      type: 'text',
      label: 'Texto',
      name: 'texto',
      value: '',
      placeholder: 'Ingrese texto...',
      colSpan: 1,
    },
    {
      id: 'input_number',
      order: 2,
      type: 'number',
      label: 'Número',
      name: 'numero',
      value: 0,
      placeholder: '0',
      colSpan: 1,
    },
    {
      id: 'input_select',
      order: 3,
      type: 'select',
      label: 'Selección',
      name: 'seleccion',
      value: '',
      placeholder: 'Seleccione una opción...',
      options: [
        { label: 'Opción 1', value: '1' },
        { label: 'Opción 2', value: '2' },
        { label: 'Opción 3', value: '3' },
      ],
      colSpan: 1,
    },
    {
      id: 'input_file',
      order: 4,
      type: 'file',
      label: 'Archivo',
      name: 'archivo',
      value: null,
      colSpan: 1,
    },
    {
      id: 'input_textarea',
      order: 5,
      type: 'textarea',
      label: 'Descripción',
      name: 'descripcion',
      value: '',
      placeholder: 'Ingrese contenido...',
      rows: 4,
      colSpan: 2,
    },
  ],
};

/**
 * Objeto secundario que almacena los valores dinámicos del formulario
 * construidos a partir de los `name` de `defaultFormSchema`.
 */
export const objectForm: FormValues = buildFormObject(defaultFormSchema);

export function syncObjectForm(values: FormValues): FormValues {
  Object.keys(objectForm).forEach((key) => {
    delete objectForm[key];
  });
  Object.assign(objectForm, values);
  return objectForm;
}
