import React from 'react';
import { StatCard } from '@/components/molecules/stat-card';
import { Alert } from '@/components/molecules/alert';
import { SystemHealth } from '../molecules/system-health';
import { GreetingInteractive } from '../molecules/greeting-interactive';

export const OverviewDashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Intro Alert */}
      <Alert
        variant="info"
        title="Arquitectura Modular Activa"
        description="Esta aplicación integra Atomic Design (Atoms, Molecules, Organisms, Templates) en el Frontend y tRPC con tipado estático extremo en la capa de API."
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Frontend Architecture"
          value="Atomic"
          badgeText="Modular"
          badgeVariant="info"
          caption="Atoms, Molecules, Organisms, Templates"
        />
        <StatCard
          label="API Layer"
          value="tRPC v11"
          badgeText="Type-safe"
          badgeVariant="success"
          caption="Validación con Zod y SuperJSON"
        />
        <StatCard
          label="Next.js Runtime"
          value="v16.4.3"
          badgeText="Turbopack"
          badgeVariant="neutral"
          caption="App Router con React 19"
        />
        <StatCard
          label="Package Manager"
          value="pnpm"
          badgeText="v12"
          badgeVariant="warning"
          caption="Node.js 26.13.0 LTS"
        />
      </div>

      {/* Main Grid: Interactive Demo & Server Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GreetingInteractive />
        </div>
        <div className="flex flex-col gap-6">
          <SystemHealth />

          {/* Architecture Summary Box */}
          <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs flex flex-col gap-3">
            <span className="font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Estructura de Directorios
            </span>
            <ul className="space-y-1.5 font-mono text-[11px] text-gray-600 dark:text-gray-400">
              <li>📁 <span className="text-blue-600 dark:text-blue-400">src/components/atoms</span>: Button, Input, Badge, Card, Spinner</li>
              <li>📁 <span className="text-blue-600 dark:text-blue-400">src/components/molecules</span>: FormField, Alert, StatCard</li>
              <li>📁 <span className="text-blue-600 dark:text-blue-400">src/components/organisms</span>: Navbar, Footer</li>
              <li>📁 <span className="text-blue-600 dark:text-blue-400">src/components/templates</span>: MainTemplate</li>
              <li>📁 <span className="text-emerald-600 dark:text-emerald-400">src/modules/overview</span>: Feature components & hooks</li>
              <li>📁 <span className="text-purple-600 dark:text-purple-400">src/server/api</span>: tRPC context, router & procedures</li>
              <li>📁 <span className="text-purple-600 dark:text-purple-400">src/app/api/trpc</span>: HTTP Fetch Route Handler</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
