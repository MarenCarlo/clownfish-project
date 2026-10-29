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
  name?: string;
  type: DynamicFieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  defaultValue?: unknown;
  disabled?: boolean;
  readOnly?: boolean;
  validation?: FieldValidation;

  // Specific to 'select'
  options?: SelectOption[];

  // Specific to 'file'
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;

  // Specific to 'number'
  step?: number | string;

  // Specific to 'textarea'
  rows?: number;

  // Grid layout column span (1 to 12)
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
