import { MainTemplate } from '@/components/templates';
import {
  DynamicForm,
  loginFormSchema,
  loginObjectForm,
} from '@/components/organisms/dynamic-form';

export { loginFormSchema, loginObjectForm };

export default function HomePage() {
  return (
    <MainTemplate>
      <div className="max-w-md mx-auto py-12">
        <DynamicForm schema={loginFormSchema} />
      </div>
    </MainTemplate>
  );
}
