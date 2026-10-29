'use client';

import React, { useState } from 'react';
import { MainTemplate } from '@/components/templates';
import { OverviewDashboard } from '@/modules/overview';
import { SuperFormShowcase } from '@/modules/super-form';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'form' | 'architecture'>('form');

  return (
    <MainTemplate>
      <div className="flex flex-col gap-8">
        {/* Navegación por Pestañas */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === 'form'
                  ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              📋 Super Formulario Dinámico (Esquema JSON)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === 'architecture'
                  ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              🏗️ Arquitectura Modular & tRPC
            </button>
          </div>
        </div>

        {/* Contenido según pestaña seleccionada */}
        {activeTab === 'form' ? <SuperFormShowcase /> : <OverviewDashboard />}
      </div>
    </MainTemplate>
  );
}
