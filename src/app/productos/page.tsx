import { MainTemplate } from '@/components/templates';
import {
  DynamicForm,
  productFormSchema,
  productObjectForm,
} from '@/components/organisms/dynamic-form';

export { productFormSchema, productObjectForm };

export default function ProductosPage() {
  return (
    <MainTemplate>
      <div className="w-full">
        <DynamicForm schema={productFormSchema} />
      </div>
    </MainTemplate>
  );
}
