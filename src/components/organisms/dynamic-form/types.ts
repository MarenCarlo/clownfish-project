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
  | 'select'
  | 'checkbox';

export interface CheckboxOption {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
}

export interface FieldValidation {
  required?: boolean | string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minSelect?: number;
  maxSelect?: number;
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
  /**
   * Nombre de la columna en la base de datos para construir dinámicamente el INSERT.
   * Si no se especifica, se utiliza `name`.
   */
  dbColumn?: string;
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

  // Especifico para select / checkbox group
  options?: (SelectOption | CheckboxOption)[];

  // Especifico para checkbox
  selectionMode?: 'single' | 'multiple';
  checkboxText?: string;
  groupDirection?: 'horizontal' | 'vertical';
  checkboxAlign?: 'horizontal' | 'vertical';

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

  // Alineación / Justificación opcional en la fila
  justify?: 'start' | 'center' | 'end' | 'between';

  // Nombres de campos que deben limpiarse automáticamente cuando este campo cambie
  resetFieldsOnChange?: string[];
}

export interface DynamicFormSchema {
  id: string;
  /**
   * Nombre de la tabla en la base de datos asociada a este formulario (ej. 'tb_products').
   */
  dbTable?: string;
  title?: string;
  description?: string;
  submitText?: string;
  resetText?: string;
  layout?: {
    columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    gap?: 'sm' | 'md' | 'lg';
    autoDistribute?: boolean; // Pone space-between si faltan columnas por rellenar en una fila
    autoCenterSingle?: boolean; // Centra en automático si un solo elemento tiene columnas sobrantes
  };
  fields: FormFieldSchema[];
}

export type FormValues = Record<string, unknown>;
export type FormErrors = Record<string, string | undefined>;

export interface SerializedFilePayload {
  __isFile: true;
  fileName: string;
  mimeType: string;
  base64: string;
}

export function isSerializedFilePayload(val: unknown): val is SerializedFilePayload {
  return (
    typeof val === 'object' &&
    val !== null &&
    '__isFile' in val &&
    (val as SerializedFilePayload).__isFile === true
  );
}

async function fileToSerializedPayload(file: File): Promise<SerializedFilePayload> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return {
    __isFile: true,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    base64: btoa(binary),
  };
}

/**
 * Construye dinámicamente el objeto mapeado a las columnas de BD (`dbColumn` o `name`)
 * a partir del esquema JSON y los valores actuales del formulario.
 */
export async function buildDbRecordFromSchema(
  schema: DynamicFormSchema,
  values: FormValues
): Promise<Record<string, unknown>> {
  const record: Record<string, unknown> = {};

  for (const field of schema.fields) {
    const key = field.name || field.id;
    const dbCol = field.dbColumn || field.name;
    if (!dbCol) continue;

    const rawVal = values[key];

    if (field.type === 'file') {
      if (rawVal instanceof File) {
        record[dbCol] = await fileToSerializedPayload(rawVal);
      } else if (Array.isArray(rawVal) && rawVal[0] instanceof File) {
        record[dbCol] = await fileToSerializedPayload(rawVal[0]);
      } else {
        record[dbCol] = rawVal ?? null;
      }
    } else if (field.type === 'number') {
      record[dbCol] =
        rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== ''
          ? Number(String(rawVal).trim())
          : null;
    } else if (field.type === 'checkbox') {
      if (Array.isArray(rawVal)) {
        // Si la columna de BD es un booleano (ej. en_oferta), evalúa si incluye el valor o tiene elementos
        if (dbCol === 'en_oferta') {
          record[dbCol] = rawVal.includes('oferta') || rawVal.length > 0 ? 1 : 0;
        } else {
          record[dbCol] = JSON.stringify(rawVal);
        }
      } else if (typeof rawVal === 'boolean') {
        record[dbCol] = rawVal ? 1 : 0;
      } else {
        record[dbCol] = rawVal ? 1 : 0;
      }
    } else {
      record[dbCol] =
        rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== ''
          ? String(rawVal).trim()
          : null;
    }
  }

  return record;
}

const SAFE_SQL_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Construye dinámicamente la sentencia SQL parametrizada `INSERT INTO ...`
 * a partir del nombre de la tabla y las columnas definidas en el esquema JSON.
 */
export function buildDynamicInsertSql(
  tableName: string,
  dbRecord: Record<string, unknown>,
  extraColumns: Record<string, unknown> = {}
): {
  sql: string;
  columns: string[];
  params: unknown[];
} {
  if (!SAFE_SQL_IDENTIFIER.test(tableName)) {
    throw new Error(`Nombre de tabla inválido: ${tableName}`);
  }

  const combined: Record<string, unknown> = {
    ...dbRecord,
    ...extraColumns,
  };

  const columns: string[] = [];
  const params: unknown[] = [];

  for (const [col, val] of Object.entries(combined)) {
    if (!SAFE_SQL_IDENTIFIER.test(col)) {
      throw new Error(`Nombre de columna inválido en esquema: ${col}`);
    }
    columns.push(`\`${col}\``);
    params.push(val === undefined ? null : val);
  }

  if (columns.length === 0) {
    throw new Error('No se encontraron columnas para construir el INSERT.');
  }

  const placeholders = columns.map(() => '?').join(', ');
  const sql = `INSERT INTO \`${tableName}\` (${columns.join(', ')}) VALUES (${placeholders})`;

  return {
    sql,
    columns,
    params,
  };
}

/**
 * Construye dinámicamente el objeto JSON de valores (objectForm)
 * en base a los `name` y `value` definidos en el esquema.
 */
export function buildFormObject(schema: DynamicFormSchema): FormValues {
  return schema.fields.reduce<FormValues>((acc, field) => {
    const key = field.name || field.id;
    let fallback: unknown = '';
    if (field.type === 'file') {
      fallback = null;
    } else if (field.type === 'checkbox') {
      fallback = field.options && field.options.length > 0
        ? (field.selectionMode === 'single' ? '' : [])
        : false;
    }
    acc[key] = field.value ?? field.defaultValue ?? fallback;
    return acc;
  }, {});
}

/**
 * Esquema JSON para captura de datos de productos de la competencia
 * (Nombre, Código de Barras, Precio, Gramaje, Unidad, Empresa, Foto y Observaciones).
 */
export const productFormSchema: DynamicFormSchema = {
  id: 'product-form',
  dbTable: 'tb_products',
  title: 'Captura de productos',
  description: 'Ingreso de datos',
  submitText: 'Guardar Producto',
  resetText: 'Limpiar',
  layout: {
    columns: 12,
    gap: 'md',
    autoDistribute: true,
    autoCenterSingle: true,
  },
  fields: [
    {
      id: 'product_barcode',
      order: 1,
      type: 'text',
      label: 'Código de Barras',
      name: 'barras',
      dbColumn: 'barras',
      value: '',
      placeholder: 'Ej. 7501058612345',
      colSpan: 4,
      validation: {
        required: 'El código de barras es obligatorio.',
      },
    },
    {
      id: 'product_price',
      order: 2,
      type: 'number',
      label: 'Precio',
      name: 'precio',
      dbColumn: 'precio',
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
      id: 'product_name',
      order: 3,
      type: 'text',
      label: 'Nombre del Producto',
      name: 'nombre',
      dbColumn: 'nombre',
      value: '',
      placeholder: 'Ej. Café Soluble Clásico',
      colSpan: 12,
      validation: {
        required: 'El nombre del producto es obligatorio.',
      },
    },

    {
      id: 'product_weight',
      order: 4,
      type: 'number',
      label: 'Gramaje',
      name: 'gramaje',
      dbColumn: 'gramaje',
      value: '',
      step: 'any',
      placeholder: 'Ej. 200',
      colSpan: 6,
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
      dbColumn: 'unidad_gramaje_id',
      value: '',
      placeholder: 'Seleccione unidad...',
      options: [],
      colSpan: 6,
      validation: {
        required: 'Seleccione una unidad de medida.',
      },
    },
    {
      id: 'product_store',
      order: 6,
      type: 'select',
      label: 'Empresa',
      name: 'empresa_producto',
      dbColumn: 'empresa_producto_id',
      value: '',
      placeholder: 'Seleccione empresa...',
      options: [],
      colSpan: 12,
      justify: 'start',
      validation: {
        required: 'Seleccione una empresa.',
      },
    },
    {
      id: 'product_department',
      order: 7,
      type: 'select',
      label: 'Departamento',
      name: 'departamento',
      dbColumn: 'departamento_id',
      value: '',
      placeholder: 'Seleccione departamento...',
      options: [],
      colSpan: 6,
      resetFieldsOnChange: ['municipio'],
      validation: {
        required: 'El departamento es obligatorio.',
      },
    },
    {
      id: 'product_municipality',
      order: 8,
      type: 'select',
      label: 'Municipio',
      name: 'municipio',
      dbColumn: 'municipio_id',
      value: '',
      placeholder: 'Seleccione municipio...',
      options: [],
      colSpan: 6,
      disabled: true,
      validation: {
        required: 'El municipio es obligatorio.',
      },
    },
    {
      id: 'field_tags',
      order: 9,
      type: 'checkbox',
      label: '',
      name: 'etiquetas',
      dbColumn: 'en_oferta',
      value: [],
      selectionMode: 'multiple',
      groupDirection: 'horizontal',
      checkboxAlign: 'vertical',
      options: [
        { label: 'En Oferta', value: 'oferta' },
      ],
      colSpan: 12,
    },
    {
      id: 'product_notes',
      order: 10,
      type: 'textarea',
      label: 'Observaciones',
      name: 'observaciones',
      dbColumn: 'observaciones',
      value: '',
      placeholder: 'Notas sobre detalles del producto como ofertas u observaciones generales...',
      rows: 3,
      maxLength: 250,
      colSpan: 12,
    },
    {
      id: 'product_photo',
      order: 11,
      type: 'file',
      label: 'Fotografía del Producto',
      name: 'foto',
      dbColumn: 'foto',
      value: null,
      accept: 'image/*',
      maxSizeMb: 5,
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
      id: 'login_username',
      order: 1,
      type: 'text',
      label: 'Usuario',
      name: 'nameUser',
      value: '',
      placeholder: 'username',
      autoComplete: 'username',
      colSpan: 1,
      validation: {
        required: 'El usuario es obligatorio.',
      },
    },
    {
      id: 'login_password',
      order: 2,
      type: 'password',
      label: 'Contraseña',
      name: 'passUser',
      value: '',
      placeholder: 'Ingrese su contraseña',
      autoComplete: 'current-password',
      colSpan: 1,
      validation: {
        required: 'La contraseña es obligatoria.',
      },
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
