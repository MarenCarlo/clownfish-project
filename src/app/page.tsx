'use client';

import { useRouter } from 'next/navigation';
import { MainTemplate } from '@/components/templates';
import {
  DynamicForm,
  loginFormSchema,
  loginObjectForm,
  type FormValues,
} from '@/components/organisms/dynamic-form';
import { useUser } from '@/contexts';

export { loginFormSchema, loginObjectForm };

export default function HomePage() {
  const router = useRouter();
  const { login } = useUser();

  const handleLoginSubmit = async (values: FormValues) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nameUser: values.nameUser,
        passUser: values.passUser,
      }),
    });

    const data = await res.json();

    if (data.error) {
      throw new Error(data.message || 'Error al iniciar sesión.');
    }

    const secureSession = await fetch('/api/auth/me', { method: 'GET' });
    const val = await secureSession.json();

    if (!val.error && val.data) {
      login(val.data);
      router.push('/productos');
    } else {
      throw new Error('Error obteniendo sesión.');
    }
  };

  return (
    <MainTemplate>
      <div className="max-w-md mx-auto py-12">
        <DynamicForm
          schema={loginFormSchema}
          onSubmit={handleLoginSubmit}
        />
      </div>
    </MainTemplate>
  );
}
