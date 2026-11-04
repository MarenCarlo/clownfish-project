'use client';

import { useMemo } from 'react';
import { MainTemplate } from '@/components/templates';
import {
  DynamicForm,
  productFormSchema,
  productObjectForm,
  type DynamicFormSchema,
} from '@/components/organisms/dynamic-form';
import { api } from '@/trpc/react';

export { productFormSchema, productObjectForm };

export default function ProductosPage() {
  const { data: gramajeUnits = [], isLoading: isLoadingUnits } =
    api.products.getGramajeUnits.useQuery();

  const schemaWithUnits = useMemo<DynamicFormSchema>(() => {
    return {
      ...productFormSchema,
      fields: productFormSchema.fields.map((field) => {
        if (field.id === 'product_unit') {
          return {
            ...field,
            placeholder: isLoadingUnits
              ? 'Cargando unidades...'
              : 'Seleccione unidad...',
            options: gramajeUnits.map((unit) => ({
              label: unit.label,
              value: unit.value,
            })),
          };
        }
        return field;
      }),
    };
  }, [gramajeUnits, isLoadingUnits]);

  return (
    <MainTemplate>
      <div className="w-full">
        <DynamicForm schema={schemaWithUnits} />
      </div>
    </MainTemplate>
  );
}
