import type { DynamicFormSchema } from '@/components/organisms/dynamic-form';

export const projectRegistrationSchema: DynamicFormSchema = {
  id: 'project-registration',
  title: '🚀 Registro de Proyecto & Especificaciones',
  description:
    'Formulario dinámico generado a partir de un esquema JSON con soporte para Text/Number, Textarea, File y Select.',
  submitText: 'Enviar y Procesar Proyecto',
  resetText: 'Limpiar Campos',
  layout: {
    columns: 2,
    gap: 'md',
  },
  fields: [
    {
      id: 'projectName',
      name: 'projectName',
      type: 'text',
      label: 'Nombre del Proyecto (Input 1: Text)',
      placeholder: 'Ej. Sistema de Pagos Cloud',
      helperText: 'Debe tener entre 3 y 50 caracteres.',
      colSpan: 1,
      validation: {
        required: 'El nombre del proyecto es obligatorio.',
        minLength: 3,
        maxLength: 50,
      },
    },
    {
      id: 'budget',
      name: 'budget',
      type: 'number',
      label: 'Presupuesto Estimado en USD (Input 1: Number)',
      placeholder: '5000',
      helperText: 'Monto numérico entre 500 y 100,000 USD.',
      step: 100,
      colSpan: 1,
      validation: {
        required: 'Debe ingresar un presupuesto.',
        min: 500,
        max: 100000,
      },
    },
    {
      id: 'category',
      name: 'category',
      type: 'select',
      label: 'Categoría Técnica (Input 4: Select)',
      placeholder: 'Selecciona una categoría...',
      helperText: 'Área principal del desarrollo.',
      colSpan: 1,
      options: [
        { label: 'Desarrollo Web & Frontend', value: 'web' },
        { label: 'Aplicaciones Móviles (iOS/Android)', value: 'mobile' },
        { label: 'Inteligencia Artificial & LLMs', value: 'ai' },
        { label: 'Infraestructura Cloud & DevOps', value: 'cloud' },
        { label: 'Ciberseguridad & Auditoría', value: 'security' },
      ],
      validation: {
        required: 'Por favor seleccione una categoría para el proyecto.',
      },
    },
    {
      id: 'projectAttachment',
      name: 'projectAttachment',
      type: 'file',
      label: 'Documento o Diagrama (Input 3: Input File)',
      helperText: 'Formatos admitidos: PDF, PNG, JPG (Máx. 5 MB).',
      accept: '.pdf,.png,.jpg,.jpeg',
      maxSizeMb: 5,
      colSpan: 1,
      validation: {
        required: 'Debe adjuntar un archivo de especificaciones.',
        maxSizeMb: 5,
      },
    },
    {
      id: 'description',
      name: 'description',
      type: 'textarea',
      label: 'Descripción Detallada del Requerimiento (Input 2: Textarea)',
      placeholder: 'Describe los requerimientos funcionales, objetivos y casos de uso...',
      helperText: 'Detalla el alcance del proyecto.',
      rows: 4,
      colSpan: 2,
      validation: {
        required: 'La descripción del proyecto es obligatoria.',
        minLength: 15,
      },
    },
  ],
};

export const supportTicketSchema: DynamicFormSchema = {
  id: 'support-ticket',
  title: '🎫 Reporte de Incidencia o Ticket de Soporte',
  description:
    'Esquema JSON alternativo para reportar incidentes con validación de correo y captura de logs.',
  submitText: 'Abrir Ticket',
  resetText: 'Restablecer',
  layout: {
    columns: 2,
    gap: 'md',
  },
  fields: [
    {
      id: 'contactEmail',
      type: 'email',
      label: 'Correo de Contacto (Input 1: Text/Email)',
      placeholder: 'soporte@empresa.com',
      colSpan: 1,
      validation: {
        required: 'El correo electrónico es requerido.',
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        patternMessage: 'Ingrese un formato de correo electrónico válido.',
      },
    },
    {
      id: 'severityLevel',
      type: 'number',
      label: 'Nivel de Severidad 1-5 (Input 1: Number)',
      placeholder: '3',
      helperText: '1 = Crítico bloqueante, 5 = Sugerencia cosmética',
      step: 1,
      colSpan: 1,
      validation: {
        required: true,
        min: 1,
        max: 5,
      },
    },
    {
      id: 'affectedArea',
      type: 'select',
      label: 'Módulo Afectado (Input 4: Select)',
      placeholder: 'Seleccione el componente con fallo...',
      colSpan: 1,
      options: [
        { label: 'Autenticación y Sesiones', value: 'auth' },
        { label: 'Pasarela de Pagos', value: 'billing' },
        { label: 'API tRPC / Base de datos', value: 'api' },
        { label: 'Interfaz de Usuario / UI', value: 'frontend' },
      ],
      validation: {
        required: 'Debe indicar el módulo afectado.',
      },
    },
    {
      id: 'logFile',
      type: 'file',
      label: 'Archivo de Log o Captura (Input 3: Input File)',
      accept: '.log,.txt,.png,.jpg',
      maxSizeMb: 10,
      colSpan: 1,
      helperText: 'Archivos de log (.log, .txt) o captura (.png, .jpg)',
    },
    {
      id: 'stepsToReproduce',
      type: 'textarea',
      label: 'Pasos para Reproducir (Input 2: Textarea)',
      placeholder: '1. Ir a la pantalla de configuración...\n2. Pulsar en guardar...',
      rows: 4,
      colSpan: 2,
      validation: {
        required: 'Describa los pasos detallados para reproducir el fallo.',
        minLength: 10,
      },
    },
  ],
};
