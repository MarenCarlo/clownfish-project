# Clownfish Project

Aplicación web desarrollada con Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 y tRPC v11 sobre Node.js 26 LTS administrado con pnpm.

La arquitectura sigue los principios de Atomic Design modular en el Frontend y una capa de procedimientos seguros de extremo a extremo con tRPC en el Backend.

---

## 1. Super Formulario Dinámico (`DynamicForm`)

El componente `DynamicForm` permite generar formularios completos y reactivos a partir de una definición en un esquema JSON.

### Tipos de Inputs Soportados

1. **Input 1: Text / Number / Password**
   * Tipos: `text`, `number`, `email`, `password`, `tel`, `url`.
   * El tipo `password` incluye botón de alternancia (mostrar/ocultar contraseña) con icono SVG y `autocomplete="current-password"`.
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
  "id": "input_email",
  "name": "correo",
  "value": "",
  "type": "email",
  "label": "Correo Electrónico",
  "order": 1
},
{
  "id": "input_name",
  "name": "nombre",
  "value": "",
  "type": "text",
  "label": "Nombre Completo",
  "order": 2
}
```

* El componente evalúa y ordena la lista de campos en memoria según el valor entero ascendente de `order`.
* Si se modifica dinámicamente el valor de `order` en el esquema, el formulario se reorganiza automáticamente en tiempo real sin perder los datos ya introducidos.

---

## 3. Construcción Dinámica de `objectForm`

Junto al esquema (`defaultFormSchema`), se utiliza la utilidad `buildFormObject(schema)` para construir automáticamente `objectForm`. Este objeto secundario toma los `name` y `value` de cada campo del esquema para mantener sincronizados todos los parámetros que se enviarán al realizar un POST:

```ts
export const objectForm: FormValues = buildFormObject(defaultFormSchema);
// Resultado inicial:
// {
//   texto: '',
//   numero: 0,
//   seleccion: '',
//   archivo: null,
//   descripcion: ''
// }
```

Al pasar `objectForm` al componente `<DynamicForm schema={defaultFormSchema} objectForm={objectForm} />`, cada cambio en los inputs actualiza automáticamente `objectForm[field.name]` en tiempo real. Además, cada etiqueta `<label>` expone los atributos `data-name` y `data-value` sincronizados con el estado actual del control.

---

## 4. Diccionario del Esquema JSON

A continuación se detalla cada propiedad disponible para estructurar el objeto JSON del formulario.

### 4.1. Propiedades Principales del Formulario (`DynamicFormSchema`)

| Propiedad | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Sí | Identificador único del formulario. |
| `title` | `string` | No | Título principal mostrado en el encabezado. |
| `description` | `string` | No | Descripción o instrucciones mostradas bajo el título. |
| `submitText` | `string` | No | Texto del botón de envío. Por defecto: "Guardar Formulario". |
| `resetText` | `string` | No | Si se define, muestra un botón secundario para limpiar el formulario. |
| `layout` | `object` | No | Configuración de distribución de columnas del formulario. |
| `layout.columns` | `1..12` | No | Cantidad total de columnas del lienzo (estilo Bootstrap) en pantallas medianas y grandes (`sm+`). En móviles se apila automáticamente en 1 columna. Por defecto: `12`. |
| `layout.gap` | `'sm' \| 'md' \| 'lg'` | No | Espaciado entre elementos del formulario. |
| `fields` | `FormFieldSchema[]` | Sí | Array con la definición de cada campo del formulario. |

---

### 4.2. Propiedades de los Campos (`FormFieldSchema`)

| Propiedad | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Sí | Identificador único del elemento en el DOM. |
| `order` | `number` (entero) | No | Define la posición y orden visual del campo. Permite reordenamiento en tiempo real. |
| `name` | `string` | Sí | Nombre del parámetro para el envío POST y clave dinámica dentro de `objectForm`. |
| `value` | `unknown` | No | Valor inicial del campo sincronizado en `objectForm` y expuesto en la etiqueta. |
| `type` | `string` | Sí | Tipo de control: `'text'`, `'number'`, `'email'`, `'password'`, `'tel'`, `'url'`, `'textarea'`, `'file'`, `'select'`. |
| `label` | `string` | Sí | Etiqueta de texto visible sobre el input (incluye `data-name` y `data-value`). |
| `placeholder`| `string` | No | Texto de ayuda mostrado cuando el campo está vacío. |
| `helperText` | `string` | No | Texto explicativo secundario que aparece debajo del input. |
| `autoComplete` | `string` | No | Valor de autocompletado HTML (ej. `'username'`, `'current-password'`). |
| `defaultValue`| `unknown` | No | Valor de respaldo si `value` no está definido. |
| `disabled` | `boolean` | No | Deshabilita la interacción con el control. |
| `readOnly` | `boolean` | No | Marca el campo como de solo lectura. |
| `colSpan` | `1..12` | No | Cantidad de columnas que ocupa el elemento dentro del lienzo `layout.columns` (ej. con `columns: 12`, permite combinaciones como `6` y `6`, `8` y `4`, `10` y `2`, o `4`, `4` y `4`). En pantallas móviles ocupa automáticamente el 100% del ancho (`col-span-1`). |

---

### 4.3. Propiedades Específicas por Tipo de Control

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
| `rows` | `number` | Altura fija en número de filas visibles (redimensionamiento manual deshabilitado con `resize-none`). |
| `maxLength` | `number` | Límite máximo de caracteres permitidos. Muestra un contador en tiempo real (`actual/máximo`) en la esquina inferior derecha dentro del `Textarea`. |

---

### 4.4. Objeto de Validaciones (`validation`)

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

## 5. Ejemplo de Implementación con `defaultFormSchema` y `objectForm`

```tsx
'use client';

import { MainTemplate } from '@/components/templates';
import {
  DynamicForm,
  buildFormObject,
  type DynamicFormSchema,
  type FormValues,
} from '@/components/organisms/dynamic-form';

export const defaultFormSchema: DynamicFormSchema = {
  id: 'main-form',
  layout: {
    columns: 2,
    gap: 'md',
  },
  fields: [
    {
      id: 'input_text',
      order: 1,
      type: 'text',
      label: 'Texto',
      name: 'texto',
      value: '',
      placeholder: 'Ingrese texto...',
      colSpan: 1,
    },
    {
      id: 'input_number',
      order: 2,
      type: 'number',
      label: 'Número',
      name: 'numero',
      value: 0,
      placeholder: '0',
      colSpan: 1,
    },
    {
      id: 'input_select',
      order: 3,
      type: 'select',
      label: 'Selección',
      name: 'seleccion',
      value: '',
      placeholder: 'Seleccione una opción...',
      options: [
        { label: 'Opción 1', value: '1' },
        { label: 'Opción 2', value: '2' },
        { label: 'Opción 3', value: '3' },
      ],
      colSpan: 1,
    },
    {
      id: 'input_file',
      order: 4,
      type: 'file',
      label: 'Archivo',
      name: 'archivo',
      value: null,
      colSpan: 1,
    },
    {
      id: 'input_textarea',
      order: 5,
      type: 'textarea',
      label: 'Descripción',
      name: 'descripcion',
      value: '',
      placeholder: 'Ingrese contenido...',
      rows: 4,
      colSpan: 2,
    },
  ],
};

export const objectForm: FormValues = buildFormObject(defaultFormSchema);

export default function HomePage() {
  return (
    <MainTemplate>
      <DynamicForm
        schema={defaultFormSchema}
        objectForm={objectForm}
        onSubmit={(values) => {
          // Tanto `values` como `objectForm` contienen los valores dinámicos
          // construidos en base a los `name` de defaultFormSchema
          console.log(objectForm);
        }}
      />
    </MainTemplate>
  );
}
```

---

## 6. Scripts Disponibles

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
