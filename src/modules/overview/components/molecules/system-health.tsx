'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { Card } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { Spinner } from '@/components/atoms/spinner';

export const SystemHealth: React.FC = () => {
  const { data, isLoading, error, refetch, isFetching } =
    api.health.check.useQuery(undefined, {
      refetchInterval: 15000,
    });

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center p-6 min-h-[140px]">
        <Spinner size="md" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-rose-700 dark:text-rose-400">
            Error de Conexión tRPC
          </span>
          <Badge variant="error" size="sm">
            Offline
          </Badge>
        </div>
        <p className="text-xs text-rose-600 dark:text-rose-300 mb-3">
          {error.message}
        </p>
        <button
          onClick={() => refetch()}
          className="text-xs underline text-rose-700 dark:text-rose-300 font-medium"
        >
          Reintentar
        </button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider">
          Estado del Servidor (tRPC)
        </span>
        <Badge variant={data?.status === 'ok' ? 'success' : 'warning'} size="sm">
          {data?.status === 'ok' ? 'En Línea' : 'Desconocido'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg">
          <span className="text-gray-500 dark:text-gray-400 block mb-1">
            Uptime del proceso
          </span>
          <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
            {Math.floor(data?.uptime ?? 0)} segundos
          </span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg">
          <span className="text-gray-500 dark:text-gray-400 block mb-1">
            Hora Servidor
          </span>
          <span className="font-mono text-gray-900 dark:text-gray-100 truncate block">
            {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '-'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-gray-400">Endpoint: /api/trpc/health.check</span>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
        >
          {isFetching ? 'Actualizando...' : 'Refrescar'}
        </button>
      </div>
    </Card>
  );
};
