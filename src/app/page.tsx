import { MainTemplate } from '@/components/templates';
import { DynamicForm, type DynamicFormSchema } from '@/components/organisms/dynamic-form';

const defaultFormSchema: DynamicFormSchema = {
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
      placeholder: 'Ingrese texto...',
      colSpan: 1,
    },
    {
      id: 'input_number',
      order: 2,
      type: 'number',
      label: 'Número',
      placeholder: '0',
      colSpan: 1,
    },
    {
      id: 'input_select',
      order: 3,
      type: 'select',
      label: 'Selección',
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
      colSpan: 1,
    },
    {
      id: 'input_textarea',
      order: 5,
      type: 'textarea',
      label: 'Descripción',
      placeholder: 'Ingrese contenido...',
      rows: 4,
      colSpan: 2,
    },
  ],
};

export default function HomePage() {
  return (
    <MainTemplate>
      <DynamicForm schema={defaultFormSchema} />
    </MainTemplate>
  );
}
