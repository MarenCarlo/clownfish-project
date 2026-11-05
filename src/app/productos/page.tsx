'use client';

import { useState, useMemo, useRef } from 'react';
import { MainTemplate } from '@/components/templates';
import {
  DynamicForm,
  productFormSchema,
  productObjectForm,
  buildDbRecordFromSchema,
  type DynamicFormSchema,
  type FormValues,
  type DynamicFormHandle,
} from '@/components/organisms/dynamic-form';
import { ProductConfirmationModal } from '@/components/organisms/product-confirmation-modal';
import { api } from '@/trpc/react';
import { toast } from 'react-toastify';

export { productFormSchema, productObjectForm };

export default function ProductosPage() {
  const formRef = useRef<DynamicFormHandle>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const { data: gramajeUnits = [], isLoading: isLoadingUnits } =
    api.products.getGramajeUnits.useQuery();

  const { data: companies = [], isLoading: isLoadingCompanies } =
    api.products.getCompanies.useQuery();

  const { data: departments = [], isLoading: isLoadingDepartments } =
    api.products.getDepartments.useQuery();

  const { data: municipalities = [], isLoading: isLoadingMunicipalities } =
    api.products.getMunicipalities.useQuery(
      { departmentId: selectedDepartment },
      { enabled: Boolean(selectedDepartment) }
    );

  const createProductMutation = api.products.createProduct.useMutation({
    onSuccess: (res) => {
      toast.success(res.message || 'Producto registrado correctamente.');
      setIsConfirmModalOpen(false);
      setPendingValues(null);
      formRef.current?.reset();
      setSelectedDepartment('');
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
        if (field.id === 'product_department') {
          return {
            ...field,
            placeholder: isLoadingDepartments
              ? 'Cargando departamentos...'
              : 'Seleccione departamento...',
            options: departments.map((dept) => ({
              label: dept.label,
              value: dept.value,
            })),
          };
        }
        if (field.id === 'product_municipality') {
          const isDeptSelected = Boolean(selectedDepartment);
          return {
            ...field,
            placeholder: !isDeptSelected
              ? 'Seleccione primero un departamento...'
              : isLoadingMunicipalities
              ? 'Cargando municipios...'
              : 'Seleccione municipio...',
            disabled: !isDeptSelected || isLoadingMunicipalities,
            options: municipalities.map((muni) => ({
              label: muni.label,
              value: muni.value,
            })),
          };
        }
        return field;
      }),
    };
  }, [
    gramajeUnits,
    isLoadingUnits,
    companies,
    isLoadingCompanies,
    departments,
    isLoadingDepartments,
    municipalities,
    isLoadingMunicipalities,
    selectedDepartment,
  ]);

  // Al enviar el formulario se abre el modal de confirmación con los datos validados
  const handleSubmit = (values: FormValues) => {
    setPendingValues(values);
    setIsConfirmModalOpen(true);
  };

  // Al confirmar en el modal, se procede a guardar en la base de datos
  const handleConfirmSave = async () => {
    if (!pendingValues) return;
    const payload = await buildDbRecordFromSchema(schemaWithCatalogs, pendingValues);
    await createProductMutation.mutateAsync(payload);
  };

  const handleFormChange = (values: FormValues) => {
    const dept = String(values.departamento ?? '');
    if (dept !== selectedDepartment) {
      setSelectedDepartment(dept);
    }
  };

  return (
    <MainTemplate>
      <div className="w-full">
        <DynamicForm
          ref={formRef}
          schema={schemaWithCatalogs}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          resetOnSubmit={false}
        />

        <ProductConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmSave}
          isLoading={createProductMutation.isPending}
          values={pendingValues}
          schema={schemaWithCatalogs}
        />
      </div>
    </MainTemplate>
  );
}
