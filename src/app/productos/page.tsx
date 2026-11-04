'use client';

import { useMemo } from 'react';
import { MainTemplate } from '@/components/templates';
import {
  DynamicForm,
  productFormSchema,
  productObjectForm,
  buildDbRecordFromSchema,
  type DynamicFormSchema,
  type FormValues,
} from '@/components/organisms/dynamic-form';
import { api } from '@/trpc/react';
import { toast } from 'react-toastify';

export { productFormSchema, productObjectForm };

export default function ProductosPage() {
  const { data: gramajeUnits = [], isLoading: isLoadingUnits } =
    api.products.getGramajeUnits.useQuery();

  const { data: companies = [], isLoading: isLoadingCompanies } =
    api.products.getCompanies.useQuery();

  const createProductMutation = api.products.createProduct.useMutation({
    onSuccess: (res) => {
      toast.success(res.message || 'Producto registrado correctamente.');
    },
    onError: (err) => {
      toast.error(err.message || 'Error al guardar el producto.');
    },
  });

  const schemaWithCatalogs = useMemo<DynamicFormSchema>(() => {
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
        if (field.id === 'product_store') {
          return {
            ...field,
            placeholder: isLoadingCompanies
              ? 'Cargando empresas...'
              : 'Seleccione empresa...',
            options: companies.map((company) => ({
              label: company.label,
              value: company.value,
            })),
          };
        }
        return field;
      }),
    };
  }, [gramajeUnits, isLoadingUnits, companies, isLoadingCompanies]);

  const handleSubmit = async (values: FormValues) => {
    // Convierte el formulario serializando archivos y respetando tipos
    const payload = await buildDbRecordFromSchema(schemaWithCatalogs, values);
    await createProductMutation.mutateAsync(payload);
  };

  return (
    <MainTemplate>
      <div className="w-full">
        <DynamicForm
          schema={schemaWithCatalogs}
          onSubmit={handleSubmit}
        />
      </div>
    </MainTemplate>
  );
}
