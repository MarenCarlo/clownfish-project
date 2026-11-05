'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import type { DynamicFormSchema, FormValues } from '@/components/organisms/dynamic-form/types';

export interface ProductConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  values: FormValues | null;
  schema: DynamicFormSchema;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ProductImagePreviewProps {
  foto: unknown;
  alt: string;
}

const ProductImagePreview: React.FC<ProductImagePreviewProps> = ({ foto, alt }) => {
  const [asyncPreviewUrl, setAsyncPreviewUrl] = useState<string | null>(null);

  const rawFoto = Array.isArray(foto) ? foto[0] : foto;

  const fileName = useMemo(() => {
    if (rawFoto instanceof File) return rawFoto.name;
    if (rawFoto && typeof rawFoto === 'object' && 'name' in rawFoto) {
      return String((rawFoto as { name?: string }).name ?? '');
    }
    return '';
  }, [rawFoto]);

  const fileSizeText = useMemo(() => {
    if (rawFoto instanceof File) return formatFileSize(rawFoto.size);
    if (rawFoto && typeof rawFoto === 'object' && 'size' in rawFoto) {
      const s = (rawFoto as { size?: number }).size;
      return s ? formatFileSize(s) : '';
    }
    return '';
  }, [rawFoto]);

  const immediateUrl = useMemo(() => {
    if (rawFoto && typeof rawFoto === 'object') {
      const obj = rawFoto as { base64?: string; url?: string };
      if (obj.base64) return obj.base64;
      if (obj.url) return obj.url;
    }
    return null;
  }, [rawFoto]);

  useEffect(() => {
    if (!(rawFoto instanceof File) || typeof window === 'undefined') {
      return;
    }

    const reader = new FileReader();
    let isMounted = true;
    reader.onload = () => {
      if (isMounted && typeof reader.result === 'string') {
        setAsyncPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(rawFoto);

    return () => {
      isMounted = false;
    };
  }, [rawFoto]);

  const previewUrl = immediateUrl || asyncPreviewUrl;

  if (previewUrl) {
    return (
      <div className="w-full flex flex-col items-center gap-2">
        <div className="w-full h-44 rounded-[15px] border border-black bg-neutral-100 overflow-hidden flex items-center justify-center p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={alt || 'Fotografía del producto'}
            className="w-full h-full object-contain"
          />
        </div>
        {(fileName || fileSizeText) && (
          <div className="w-full text-center px-1">
            <p className="text-xs font-semibold text-black truncate">
              {fileName}
            </p>
            {fileSizeText && (
              <p className="text-[11px] text-neutral-500">
                {fileSizeText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-44 rounded-[15px] border border-dashed border-black/40 bg-neutral-50 flex flex-col items-center justify-center text-neutral-500 p-4 text-center">
      <svg
        className="w-8 h-8 mb-2 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span className="text-xs font-medium">Sin imagen cargada</span>
    </div>
  );
};

export const ProductConfirmationModal: React.FC<ProductConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  values,
  schema,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Bloquear scroll de fondo mientras el modal está abierto
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Manejo de tecla Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  // Helpers para resolver etiquetas legibles desde el esquema y catálogos
  const getCatalogLabel = useMemo(() => {
    return (fieldKey: string, rawVal: unknown): string => {
      if (rawVal === undefined || rawVal === null || rawVal === '') return '-';
      const field = schema.fields.find(
        (f) => f.name === fieldKey || f.id === fieldKey || f.dbColumn === fieldKey
      );
      if (!field?.options || field.options.length === 0) {
        return String(rawVal);
      }
      const match = field.options.find(
        (opt) => String(opt.value) === String(rawVal)
      );
      return match ? match.label : String(rawVal);
    };
  }, [schema]);

  if (!isOpen || !values) {
    return null;
  }

  // Extracción y formateo de datos
  const nombre = String(values.nombre ?? '').trim() || '-';
  const barras = String(values.barras ?? '').trim() || '-';
  const precioNum = Number(values.precio);
  const precioFormatted = !isNaN(precioNum)
    ? `Q ${precioNum.toFixed(2)}`
    : values.precio
    ? `Q ${String(values.precio)}`
    : 'Q 0.00';

  const gramajeNum = values.gramaje ? String(values.gramaje) : '';
  const unidadLabel = getCatalogLabel('unidad_gramaje', values.unidad_gramaje);
  const gramajeCompleto = gramajeNum
    ? `${gramajeNum} ${unidadLabel !== '-' ? unidadLabel : ''}`.trim()
    : '-';

  const empresaLabel = getCatalogLabel('empresa_producto', values.empresa_producto);
  const departamentoLabel = getCatalogLabel('departamento', values.departamento);
  const municipioLabel = getCatalogLabel('municipio', values.municipio);

  const isOferta = Array.isArray(values.etiquetas)
    ? values.etiquetas.includes('oferta')
    : Boolean(values.etiquetas);

  const observaciones = String(values.observaciones ?? '').trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl bg-white border border-black rounded-xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[92vh]">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black bg-white">
          <div className="flex flex-col">
            <h2
              id="modal-product-confirm-title"
              className="text-base sm:text-lg font-bold text-black"
            >
              Confirmación de Producto
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Verifique los datos capturados antes de registrarlos en el sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cerrar modal de confirmación"
            className="p-1 text-black hover:text-neutral-500 rounded transition-colors disabled:opacity-40 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cuerpo del Modal (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Sección de Fotografía y Resumen Superior */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Vista Previa de la Fotografía */}
            <div className="sm:col-span-5 flex flex-col items-center">
              <ProductImagePreview foto={values.foto} alt={nombre} />
            </div>

            {/* Tarjeta de Destacados: Nombre, Precio y Estado */}
            <div className="sm:col-span-7 flex flex-col justify-between h-full space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Producto
                </span>
                <h3 className="text-lg font-bold text-black leading-snug">
                  {nombre}
                </h3>
              </div>

              <div className="p-3.5 rounded-[15px] border border-black bg-neutral-50 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-neutral-600 block">
                    Precio Capturado
                  </span>
                  <span className="text-2xl font-black text-black">
                    {precioFormatted}
                  </span>
                </div>

                <div>
                  {isOferta ? (
                    <Badge variant="success" size="md">
                      En Oferta
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="md">
                      Precio Regular
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Código de Barras
                </span>
                <span className="font-mono text-sm font-bold text-black tracking-wider bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300 inline-block mt-0.5">
                  {barras}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-black/15" />

          {/* Grilla Detallada de Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Gramaje y Unidad */}
            <div className="p-3 rounded-[12px] border border-black/20 bg-white">
              <span className="text-[11px] font-semibold text-neutral-500 block mb-0.5">
                Gramaje / Presentación
              </span>
              <span className="text-sm font-semibold text-black">
                {gramajeCompleto}
              </span>
            </div>

            {/* Empresa */}
            <div className="p-3 rounded-[12px] border border-black/20 bg-white">
              <span className="text-[11px] font-semibold text-neutral-500 block mb-0.5">
                Empresa
              </span>
              <span className="text-sm font-semibold text-black">
                {empresaLabel}
              </span>
            </div>

            {/* Departamento */}
            <div className="p-3 rounded-[12px] border border-black/20 bg-white">
              <span className="text-[11px] font-semibold text-neutral-500 block mb-0.5">
                Departamento
              </span>
              <span className="text-sm font-semibold text-black">
                {departamentoLabel}
              </span>
            </div>

            {/* Municipio */}
            <div className="p-3 rounded-[12px] border border-black/20 bg-white">
              <span className="text-[11px] font-semibold text-neutral-500 block mb-0.5">
                Municipio
              </span>
              <span className="text-sm font-semibold text-black">
                {municipioLabel}
              </span>
            </div>
          </div>

          {/* Observaciones */}
          <div className="p-3 rounded-[12px] border border-black/20 bg-neutral-50 text-xs">
            <span className="text-[11px] font-semibold text-neutral-500 block mb-1">
              Observaciones
            </span>
            <p className="text-black text-xs whitespace-pre-wrap">
              {observaciones || (
                <span className="italic text-neutral-400">
                  Sin observaciones adicionales registradas.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Pie de Acciones */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black bg-neutral-50">
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={isLoading}
            onClick={onClose}
          >
            Modificar
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={isLoading}
            onClick={onConfirm}
          >
            Confirmar y Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};
