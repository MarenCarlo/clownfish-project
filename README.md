# Clownfish Project

Aplicación web desarrollada con Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 y tRPC v11 sobre Node.js 26 LTS administrado con pnpm.

La arquitectura sigue los principios de Atomic Design modular en el Frontend y una capa de procedimientos seguros de extremo a extremo con tRPC en el Backend.

---

## 1. Super Formulario Dinámico (`DynamicForm`)

El componente `DynamicForm` permite generar formularios completos y reactivos a partir de una definición en un esquema JSON.

### Tipos de Inputs Soportados

1. **Input 1: Text / Number**
   * Tipos: `text`, `number`, `email`, `password`, `tel`, `url`.
   * Permite definir restricciones de longitud, pasos numéricos (`step`), rangos mínimos y máximos (`min`, `max`) y patrones de validación (`pattern`).
2. **Input 2: Textarea**
   * Tipo: `textarea`.
   * Permite texto multilínea con control del número de filas iniciales (`rows`) y validaciones de longitud.
3. **Input 3: Input File**
   * Tipo: `file`.
   * Incluye soporte para arrastrar y soltar (drag and drop), selector manual, previsualización de nombres y tamaños de archivo, eliminación de archivos seleccionados, restricción por extensiones (`accept`) y control de peso máximo en megabytes (`maxSizeMb`).
4. **Input 4: Select**
   * Tipo: `select`.
   * Menú desplegable configurable mediante un array de objetos con `label`, `value` y estado `disabled`.

---

## 2. Orden Dinámico en Tiempo Real (`order: number`)

Cada campo dentro del array `fields` del esquema JSON admite la propiedad numérica entera `order`.

```json
{
  "id": "correo",
  "type": "email",
  "label": "Correo Electrónico",
  "order": 1
},
{
  "id": "nombre",
  "type": "text",
  "label": "Nombre Completo",
  "order": 2
}
```

* El componente evalúa y ordena la lista de campos en memoria según el valor entero ascendente de `order`.
* Si se modifica dinámicamente el valor de `order` en el esquema (por ejemplo, mediante estado de React o una respuesta de API), el formulario se reorganiza automáticamente en tiempo real sin perder los datos ya introducidos en los campos.
* Si se omite la propiedad `order` en un campo, su valor por defecto se considera `0`.

---

## 3. Diccionario del Esquema JSON

A continuación se detalla cada propiedad disponible para estructurar el objeto JSON del formulario.

### 3.1. Propiedades Principales del Formulario (`DynamicFormSchema`)

| Propiedad | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Sí | Identificador único del formulario. |
| `title` | `string` | No | Título principal mostrado en el encabezado. |
| `description` | `string` | No | Descripción o instrucciones mostradas bajo el título. |
| `submitText` | `string` | No | Texto del botón de envío. Por defecto: "Guardar Formulario". |
| `resetText` | `string` | No | Si se define, muestra un botón secundario para limpiar el formulario. |
| `layout` | `object` | No | Configuración de distribución de columnas del formulario. |
| `layout.columns` | `1 \| 2 \| 3 \| 4` | No | Cantidad de columnas base en pantallas medianas y grandes. Por defecto: `1`. |
| `layout.gap` | `'sm' \| 'md' \| 'lg'` | No | Espaciado entre elementos del formulario. |
| `fields` | `FormFieldSchema[]` | Sí | Array con la definición de cada campo del formulario. |

---

### 3.2. Propiedades de los Campos (`FormFieldSchema`)

| Propiedad | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Sí | Clave única del campo. Se utiliza como clave en el objeto JSON de salida. |
| `order` | `number` (entero) | No | Define la posición y orden visual del campo. Permite reordenamiento en tiempo real. |
| `name` | `string` | No | Atributo `name` de HTML. Si se omite, toma el valor de `id`. |
| `type` | `string` | Sí | Tipo de control: `'text'`, `'number'`, `'email'`, `'password'`, `'tel'`, `'url'`, `'textarea'`, `'file'`, `'select'`. |
| `label` | `string` | Sí | Etiqueta de texto visible sobre el input. |
| `placeholder`| `string` | No | Texto de ayuda mostrado cuando el campo está vacío. |
| `helperText` | `string` | No | Texto explicativo secundario que aparece debajo del input. |
| `defaultValue`| `unknown` | No | Valor con el que se inicializa el campo. |
| `disabled` | `boolean` | No | Deshabilita la interacción con el control. |
| `readOnly` | `boolean` | No | Marca el campo como de solo lectura. |
| `colSpan` | `1 \| 2 \| 3 \| 4 \| 6 \| 12` | No | Cantidad de columnas que abarca el campo dentro de la cuadrícula. |

---

### 3.3. Propiedades Específicas por Tipo de Control

#### Para `type: "select"`
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `options` | `Array<{ label: string; value: string \| number; disabled?: boolean }>` | Lista de opciones desplegables. |

#### Para `type: "file"`
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `accept` | `string` | Extensiones o tipos MIME permitidos (ej. `".pdf,.png,.jpg"` o `"image/*"`). |
| `multiple` | `boolean` | Permite seleccionar múltiples archivos si es `true`. |
| `maxSizeMb` | `number` | Tamaño máximo por archivo permitido en megabytes. |

#### Para `type: "number"`
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `step` | `number \| string` | Incremento permitido (ej. `1`, `0.01` o `"any"`). |

#### Para `type: "textarea"`
| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `rows` | `number` | Número de líneas visibles por defecto. |

---

### 3.4. Objeto de Validaciones (`validation`)

| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `required` | `boolean \| string` | Indica si el campo es obligatorio. Si es un `string`, se usa como mensaje de error personalizado. |
| `min` | `number` | Valor numérico mínimo permitido (`type: "number"`). |
| `max` | `number` | Valor numérico máximo permitido (`type: "number"`). |
| `minLength` | `number` | Longitud mínima de caracteres (`text`, `textarea`). |
| `maxLength` | `number` | Longitud máxima de caracteres (`text`, `textarea`). |
| `pattern` | `string \| RegExp` | Expresión regular para validar el contenido. |
| `patternMessage`| `string` | Mensaje de error personalizado en caso de fallar el patrón. |
| `maxSizeMb` | `number` | Límite de tamaño para archivos en MB. |
| `customValidator` | `(value, formData) => string \| undefined` | Función de validación personalizada. Si retorna un texto, se considera error. |

---

## 4. Ejemplo de Implementación en React

```tsx
import React, { useState } from 'react';
import { DynamicForm, type DynamicFormSchema, type FormValues } from '@/components/organisms/dynamic-form';

const registroSchema: DynamicFormSchema = {
  id: 'formulario-registro',
  title: 'Registro de Solicitud',
  description: 'Complete los datos solicitados en el formulario.',
  submitText: 'Enviar Solicitud',
  resetText: 'Limpiar',
  layout: {
    columns: 2,
    gap: 'md',
  },
  fields: [
    {
      id: 'nombre',
      order: 1,
      type: 'text',
      label: 'Nombre Completo',
      placeholder: 'Ej. María González',
      colSpan: 1,
      validation: {
        required: 'El nombre es obligatorio.',
        minLength: 3,
      },
    },
    {
      id: 'edad',
      order: 2,
      type: 'number',
      label: 'Edad',
      placeholder: '30',
      colSpan: 1,
      validation: {
        required: true,
        min: 18,
        max: 99,
      },
    },
    {
      id: 'departamento',
      order: 3,
      type: 'select',
      label: 'Departamento',
      colSpan: 1,
      placeholder: 'Seleccione un departamento...',
      options: [
        { label: 'Ingeniería y Software', value: 'engineering' },
        { label: 'Diseño de Producto', value: 'design' },
        { label: 'Operaciones', value: 'operations' },
      ],
      validation: {
        required: 'Debe seleccionar un departamento.',
      },
    },
    {
      id: 'documento',
      order: 4,
      type: 'file',
      label: 'Documento de Identidad o Comprobante',
      helperText: 'Archivos PDF o imágenes (máx. 5 MB).',
      accept: '.pdf,.png,.jpg',
      maxSizeMb: 5,
      colSpan: 1,
      validation: {
        required: 'Debe adjuntar un archivo válido.',
        maxSizeMb: 5,
      },
    },
    {
      id: 'comentarios',
      order: 5,
      type: 'textarea',
      label: 'Comentarios Adicionales',
      placeholder: 'Detalles u observaciones...',
      rows: 4,
      colSpan: 2,
      validation: {
        maxLength: 500,
      },
    },
  ],
};

export default function PaginaRegistro() {
  const [datosFormulario, setDatosFormulario] = useState<FormValues>({});

  const handleSubmit = async (valores: FormValues) => {
    console.log('Valores procesados:', valores);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <DynamicForm
        schema={registroSchema}
        onChange={setDatosFormulario}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

---

## 5. Scripts Disponibles

El proyecto utiliza **pnpm** como gestor de paquetes y Node.js 26 LTS:

```bash
# Activar version de Node.js mediante .nvmrc
nvm use

# Iniciar servidor de desarrollo
pnpm dev

# Compilar proyecto para produccion
pnpm build

# Ejecutar analisis estatico con ESLint
pnpm lint
```
