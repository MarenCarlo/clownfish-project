import { MainTemplate } from '@/components/templates';
import {
  DynamicForm,
  defaultFormSchema,
  objectForm,
} from '@/components/organisms/dynamic-form';

export { defaultFormSchema, objectForm };

export default function HomePage() {
  return (
    <MainTemplate>
      <DynamicForm schema={defaultFormSchema} />
    </MainTemplate>
  );
}
