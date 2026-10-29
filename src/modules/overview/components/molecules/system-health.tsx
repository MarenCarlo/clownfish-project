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
      <Card className="border-status-error bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-status-error">
            Error de Conexión tRPC
          </span>
          <Badge variant="error" size="sm">
            Offline
          </Badge>
        </div>
        <p className="text-xs text-status-error mb-3">
          {error.message}
        </p>
        <button
          onClick={() => refetch()}
          className="text-xs underline text-status-error font-medium cursor-pointer"
        >
          Reintentar
        </button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-semibold text-black tracking-wider">
          Estado del Servidor (tRPC)
        </span>
        <Badge variant={data?.status === 'ok' ? 'success' : 'warning'} size="sm">
          {data?.status === 'ok' ? 'En Línea' : 'Desconocido'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white border border-black p-2.5 rounded-none">
          <span className="text-black block mb-1">
            Uptime del proceso
          </span>
          <span className="font-mono font-bold text-black">
            {Math.floor(data?.uptime ?? 0)} segundos
          </span>
        </div>
        <div className="bg-white border border-black p-2.5 rounded-none">
          <span className="text-black block mb-1">
            Hora Servidor
          </span>
          <span className="font-mono text-black truncate block">
            {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '-'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-black">Endpoint: /api/trpc/health.check</span>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-[11px] text-black underline disabled:opacity-40 cursor-pointer"
        >
          {isFetching ? 'Actualizando...' : 'Refrescar'}
        </button>
      </div>
    </Card>
  );
};
