import type { SelectOption } from '@/components/atoms/dynamic-forms';

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
  autoComplete?: string;
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

  // Especifico para textarea / text
  rows?: number;
  maxLength?: number;

  // Espacio de columnas en grid (1 a 12)
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

export interface DynamicFormSchema {
  id: string;
  title?: string;
  description?: string;
  submitText?: string;
  resetText?: string;
  layout?: {
    columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
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

/**
 * Esquema JSON para captura de datos de productos de la competencia
 * (Nombre, Código de Barras, Precio, Gramaje, Unidad, Foto y Observaciones).
 */
export const productFormSchema: DynamicFormSchema = {
  id: 'product-form',
  title: 'Captura de productos',
  description: 'Captura de precios, gramaje, código de barras y fotografía del producto.',
  submitText: 'Guardar Producto',
  resetText: 'Limpiar',
  layout: {
    columns: 12,
    gap: 'md',
  },
  fields: [
    {
      id: 'product_name',
      order: 1,
      type: 'text',
      label: 'Nombre del Producto',
      name: 'nombre',
      value: '',
      placeholder: 'Ej. Café Soluble Clásico',
      colSpan: 8,
      validation: {
        required: 'El nombre del producto es obligatorio.',
      },
    },
    {
      id: 'product_barcode',
      order: 2,
      type: 'text',
      label: 'Código de Barras',
      name: 'barras',
      value: '',
      placeholder: 'Ej. 7501058612345',
      colSpan: 4,
      validation: {
        required: 'El código de barras es obligatorio.',
      },
    },
    {
      id: 'product_price',
      order: 3,
      type: 'number',
      label: 'Precio',
      name: 'precio',
      value: '',
      step: '0.01',
      placeholder: '0.00',
      colSpan: 4,
      validation: {
        required: 'El precio es obligatorio.',
        min: 0,
      },
    },
    {
      id: 'product_weight',
      order: 4,
      type: 'number',
      label: 'Gramaje',
      name: 'gramaje',
      value: '',
      step: 'any',
      placeholder: 'Ej. 200',
      colSpan: 4,
      validation: {
        required: 'El gramaje es obligatorio.',
        min: 0,
      },
    },
    {
      id: 'product_unit',
      order: 5,
      type: 'select',
      label: 'Unidad de Gramaje',
      name: 'unidad_gramaje',
      value: 'g',
      placeholder: 'Seleccione unidad...',
      options: [
        { label: 'Gramos (g)', value: 'g' },
        { label: 'Kilogramos (kg)', value: 'kg' },
        { label: 'Mililitros (ml)', value: 'ml' },
        { label: 'Litros (L)', value: 'l' },
        { label: 'Pieza (pz)', value: 'pz' },
      ],
      colSpan: 4,
      validation: {
        required: 'Seleccione una unidad de medida.',
      },
    },
    {
      id: 'product_notes',
      order: 6,
      type: 'textarea',
      label: 'Observaciones',
      name: 'observaciones',
      value: '',
      placeholder: 'Tienda competidora, ubicación o notas sobre el precio...',
      rows: 3,
      maxLength: 250,
      colSpan: 12,
    },
    {
      id: 'product_photo',
      order: 7,
      type: 'file',
      label: 'Fotografía del Producto',
      name: 'foto',
      value: null,
      accept: 'image/*',
      maxSizeMb: 10,
      helperText: 'Subir foto del producto o etiqueta de precio en anaquel (JPG, PNG, WEBP).',
      colSpan: 12,
      validation: {
        required: 'La fotografía del producto es obligatoria.',
        maxSizeMb: 10,
      },
    },
  ],
};

export const defaultFormSchema: DynamicFormSchema = productFormSchema;

/**
 * Esquema JSON para el formulario de Login (sin registro, ni olvidar contraseña, ni recordarme).
 */
export const loginFormSchema: DynamicFormSchema = {
  id: 'login-form',
  title: 'Iniciar Sesión',
  submitText: 'Iniciar Sesión',
  layout: {
    columns: 1,
    gap: 'md',
  },
  fields: [
    {
      id: 'login_email',
      order: 1,
      type: 'email',
      label: 'Correo Electrónico',
      name: 'email',
      value: '',
      placeholder: 'correo@ejemplo.com',
      autoComplete: 'username',
      colSpan: 1,
    },
    {
      id: 'login_password',
      order: 2,
      type: 'password',
      label: 'Contraseña',
      name: 'password',
      value: '',
      placeholder: 'Ingrese su contraseña',
      autoComplete: 'current-password',
      colSpan: 1,
    },
  ],
};

/**
 * Objeto secundario que almacena los valores dinámicos del formulario de productos
 * construidos a partir de los `name` de `productFormSchema`.
 */
export const productObjectForm: FormValues = buildFormObject(productFormSchema);

export const objectForm: FormValues = productObjectForm;

/**
 * Objeto secundario que almacena los valores dinámicos del formulario de Login.
 */
export const loginObjectForm: FormValues = buildFormObject(loginFormSchema);

export function syncObjectForm(
  values: FormValues,
  schemaId?: string
): FormValues {
  const target = schemaId === 'login-form' ? loginObjectForm : productObjectForm;
  Object.keys(target).forEach((key) => {
    delete target[key];
  });
  Object.assign(target, values);
  return target;
}
