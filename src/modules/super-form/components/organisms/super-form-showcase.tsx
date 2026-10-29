'use client';

import React, { useState } from 'react';
import { Card } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { DynamicForm, type FormValues } from '@/components/organisms/dynamic-form';
import {
  projectRegistrationSchema,
  supportTicketSchema,
} from '../../schemas/sample-schemas';

export const SuperFormShowcase: React.FC = () => {
  const [activeSchemaKey, setActiveSchemaKey] = useState<'project' | 'support'>(
    'project'
  );
  const [currentValues, setCurrentValues] = useState<FormValues>({});
  const [lastSubmission, setLastSubmission] = useState<{
    schemaId: string;
    submittedAt: string;
    data: Record<string, unknown>;
  } | null>(null);

  const activeSchema =
    activeSchemaKey === 'project' ? projectRegistrationSchema : supportTicketSchema;

  const handleSubmit = async (values: FormValues) => {
    // Simulamos latencia de red
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Convertimos referencias a archivos para el inspector de JSON
    const serializedData: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val instanceof File) {
        serializedData[key] = {
          name: val.name,
          size: `${(val.size / 1024).toFixed(1)} KB`,
          type: val.type,
        };
      } else if (Array.isArray(val) && val[0] instanceof File) {
        serializedData[key] = (val as File[]).map((f) => ({
          name: f.name,
          size: `${(f.size / 1024).toFixed(1)} KB`,
        }));
      } else {
        serializedData[key] = val;
      }
    }

    setLastSubmission({
      schemaId: activeSchema.id,
      submittedAt: new Date().toLocaleTimeString(),
      data: serializedData,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Selector de Esquema JSON */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Super Formulario Dinámico por Esquema JSON
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Selecciona un esquema JSON para renderizar los 4 tipos de inputs automáticamente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveSchemaKey('project');
              setCurrentValues({});
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSchemaKey === 'project'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Esquema: Registro de Proyecto
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSchemaKey('support');
              setCurrentValues({});
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSchemaKey === 'support'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Esquema: Ticket Soporte
          </button>
        </div>
      </div>

      {/* Grid Principal: Formulario a la izquierda, JSON en vivo a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Render del Super Form */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <DynamicForm
            key={activeSchemaKey}
            schema={activeSchema}
            onChange={(vals) => setCurrentValues(vals)}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Inspección de Esquema y Datos en Tiempo Real */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Tipos de Inputs Soportados */}
          <Card className="p-4 flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Controles Implementados
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                <span className="text-blue-500 font-bold">1.</span>
                <span>Text / Number</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                <span className="text-emerald-500 font-bold">2.</span>
                <span>Textarea</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                <span className="text-amber-500 font-bold">3.</span>
                <span>Input File</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                <span className="text-purple-500 font-bold">4.</span>
                <span>Select</span>
              </div>
            </div>
          </Card>

          {/* Visor de JSON en Vivo */}
          <Card className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Estado del Formulario (JSON en vivo)
              </span>
              <Badge variant="success" size="sm">
                Sincronizado
              </Badge>
            </div>
            <pre className="p-3 rounded-lg bg-gray-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(currentValues).map(([k, v]) => [
                    k,
                    v instanceof File
                      ? `[File: ${v.name} (${(v.size / 1024).toFixed(1)} KB)]`
                      : v,
                  ])
                ),
                null,
                2
              )}
            </pre>
          </Card>

          {/* Último Envío */}
          {lastSubmission && (
            <Card className="p-4 flex flex-col gap-2 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10">
              <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900/50 pb-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Último Envío Exitoso ({lastSubmission.submittedAt})
                </span>
                <Badge variant="success" size="sm">
                  Procesado
                </Badge>
              </div>
              <pre className="p-3 rounded-lg bg-gray-900 text-gray-100 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                {JSON.stringify(lastSubmission.data, null, 2)}
              </pre>
            </Card>
          )}

          {/* Esquema JSON Fuente */}
          <Card className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Definición del Esquema JSON (Input fields)
              </span>
              <Badge variant="neutral" size="sm">
                {activeSchema.fields.length} campos
              </Badge>
            </div>
            <pre className="p-3 rounded-lg bg-gray-950 text-blue-300 font-mono text-[10px] overflow-x-auto max-h-64 leading-relaxed">
              {JSON.stringify(activeSchema, null, 2)}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
};
