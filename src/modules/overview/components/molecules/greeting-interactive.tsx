'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { Card } from '@/components/atoms/card';
import { Button } from '@/components/atoms/button';
import { FormField } from '@/components/molecules/form-field';
import { Alert } from '@/components/molecules/alert';
import { Spinner } from '@/components/atoms/spinner';

export const GreetingInteractive: React.FC = () => {
  const [name, setName] = useState('Desarrollador');
  const [submittedName, setSubmittedName] = useState('Desarrollador');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [lastMutationResult, setLastMutationResult] = useState<string | null>(null);

  // tRPC Query
  const { data, isLoading, isFetching } = api.greeting.hello.useQuery(
    { name: submittedName },
    { enabled: submittedName.length > 0 }
  );

  // tRPC Mutation
  const feedbackMutation = api.greeting.sendFeedback.useMutation({
    onSuccess: (res) => {
      setLastMutationResult(res.message);
      setFeedbackInput('');
    },
  });

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setSubmittedName(name.trim());
    }
  };

  const handleMutationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackInput.trim()) {
      feedbackMutation.mutate({
        message: feedbackInput.trim(),
        author: name.trim() || undefined,
      });
    }
  };

  return (
    <Card className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">
            Prueba Interactiva de Procedimientos tRPC
          </h3>
          {isFetching && <Spinner size="sm" />}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Ejecución end-to-end con tipado estático inferido entre cliente y servidor.
        </p>
      </div>

      {/* Query Section */}
      <div className="bg-gray-50/70 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col gap-3">
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          1. tRPC Query (api.greeting.hello)
        </span>
        <form onSubmit={handleQuerySubmit} className="flex gap-2 items-end">
          <FormField
            label="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Juan Pérez"
          />
          <Button type="submit" size="md">
            Consultar
          </Button>
        </form>

        <div className="mt-1 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm">
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Spinner size="sm" />
              <span>Consultando tRPC...</span>
            </div>
          ) : (
            <div>
              <span className="font-bold text-gray-900 dark:text-gray-100 block">
                {data?.greeting ?? 'Sin respuesta'}
              </span>
              <span className="text-[11px] text-gray-400">
                Timestamp: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '-'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mutation Section */}
      <div className="bg-gray-50/70 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col gap-3">
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          2. tRPC Mutation (api.greeting.sendFeedback)
        </span>
        <form onSubmit={handleMutationSubmit} className="flex flex-col gap-2">
          <FormField
            label="Enviar mensaje al backend"
            value={feedbackInput}
            onChange={(e) => setFeedbackInput(e.target.value)}
            placeholder="Escribe un mensaje para mutar datos..."
            error={feedbackMutation.error?.message}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={feedbackMutation.isPending}
            >
              Enviar Mensaje
            </Button>
          </div>
        </form>

        {lastMutationResult && (
          <Alert
            variant="success"
            title="Mutación Exitosa"
            description={lastMutationResult}
          />
        )}
      </div>
    </Card>
  );
};
