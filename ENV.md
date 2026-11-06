# Diccionario de Variables de Entorno - Clownfish Project

Este documento detalla todas las variables de entorno requeridas y opcionales para la ejecución de **Clownfish Project** tanto en entornos de desarrollo local como en despliegues a producción (Alpha / Beta / Release).

---

## 1. Instrucciones de Configuración

1. Copia el archivo `.env.example` (o crea un archivo `.env` en la raíz del proyecto):
   ```bash
   cp .env.example .env
   ```
2. Completa los valores con las credenciales y URLs correspondientes a tu entorno.
3. Asegúrate de **nunca comitear** archivos `.env` o `.env.local` con credenciales reales a repositorios públicos o compartidos.

> [!NOTE]
> Las variables con el prefijo `NEXT_PUBLIC_` son accesibles en el navegador (lado cliente). Todas las demás son privadas y únicamente accesibles por el runtime de Node.js en el servidor.

---

## 2. Diccionario Detallado por Módulos

### 2.1. Aplicación y Servidor Web

| Variable | Tipo | Requerida | Ámbito | Valor de Ejemplo | Descripción |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | String (URL) | **Sí** | Cliente / Servidor | `http://localhost:3000` | URL base canónica de la aplicación web. Usada para resolver enlaces y rutas absolutas. |
| `PORT` | Entero | No | Servidor | `3000` | Puerto en el que escucha el servidor Next.js (por defecto: `3000`). |
| `NODE_ENV` | Enum | No | Servidor | `development` o `production` | Entorno de ejecución de Node.js. Habilita optimizaciones y logs detallados. |

---

### 2.2. Almacenamiento de Archivos y Fotografías (MinIO / S3)

Módulo encargado de persistir y servir las imágenes capturadas de los productos y etiquetas.

| Variable | Tipo | Requerida | Ámbito | Valor de Ejemplo | Descripción |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `MINIO_STORAGE_ENDPOINT` | String (Host:Puerto) | **Sí** | Servidor | `oasiscloud.tdoriente.com:9600` | Host y puerto del servidor MinIO (sin `http://` ni `https://`). |
| `MINIO_STORAGE_ACCESS_KEY` | String | **Sí** | Servidor | `uLfIZLH8KLLPShia` | Llave de acceso (*Access Key*) de MinIO con permisos de lectura y escritura. |
| `MINIO_STORAGE_SECRET_KEY` | String | **Sí** | Servidor | `t1GjKrhmSKAP...` | Clave secreta (*Secret Key*) asociada a la cuenta de MinIO. |
| `MINIO_STORAGE_MEDIA_BUCKET_NAME`| String | **Sí** | Servidor | `tdoriente` | Nombre del bucket dentro de MinIO donde se alojan los archivos (`products/...`). |
| `MINIO_STORAGE_USE_HTTPS` | Booleano (`true`/`false`) | **Sí** | Servidor | `false` | Indica si la conexión hacia MinIO debe utilizar protocolo seguro SSL/TLS (`https`). |

---

### 2.3. Base de Datos 1: Autenticación y Usuarios Remotos (`oasis_one`)

Conexión hacia la base de datos central corporativa que almacena los usuarios del sistema (`auth_user`), perfiles y permisos.

| Variable | Tipo | Requerida | Ámbito | Valor de Ejemplo | Descripción |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `DB_AUTH_HOST` | String (IP / Host) | **Sí** | Servidor | `192.168.250.99` | Dirección IP o nombre de host del servidor MariaDB/MySQL de autenticación. |
| `DB_AUTH_PORT` | Entero | No | Servidor | `3306` | Puerto del motor de base de datos (por defecto: `3306`). |
| `DB_AUTH_USER` | String | **Sí** | Servidor | `root` | Usuario con privilegios de lectura sobre la base de datos `oasis_one`. |
| `DB_AUTH_PASSWORD` | String | **Sí** | Servidor | `Admin2020` | Contraseña del usuario de la base de datos de autenticación. |
| `DB_AUTH_NAME` | String | **Sí** | Servidor | `oasis_one` | Nombre de la base de datos de autenticación central. |

---

### 2.4. Base de Datos 2: Clownfish Data (`ClownfishDB`)

Conexión hacia la base de datos propia del proyecto que almacena los catálogos, productos, precios e historial cronológico.

| Variable | Tipo | Requerida | Ámbito | Valor de Ejemplo | Descripción |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `DB_HOST` | String (IP / Host) | **Sí** | Servidor | `192.168.250.99` | Dirección IP o nombre de host del servidor MariaDB de Clownfish. |
| `DB_PORT` | Entero | No | Servidor | `3306` | Puerto del motor de base de datos (por defecto: `3306`). |
| `DB_USER` | String | **Sí** | Servidor | `root` | Usuario con permisos `SELECT`, `INSERT`, `UPDATE` sobre `ClownfishDB`. |
| `DB_PASSWORD` | String | **Sí** | Servidor | `Admin2020` | Contraseña del usuario de base de datos. |
| `DB_NAME` | String | **Sí** | Servidor | `ClownfishDB` | Nombre de la base de datos operativa del sistema. |

---

### 2.5. Seguridad y Sesiones (JWT)

| Variable | Tipo | Requerida | Ámbito | Valor de Ejemplo | Descripción |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `JWT_TOKEN_SECRET` | String | **Sí** | Servidor | `oasis_super_secret_jwt_token_2026` | Clave criptográfica para firmar y verificar tokens de sesión y cookies seguras. |

---

### 2.6. Integraciones Opcionales (Bot de Notificaciones Telegram)

Parámetros opcionales para alertas o notificaciones a través de la API de Telegram.

| Variable | Tipo | Requerida | Ámbito | Valor de Ejemplo | Descripción |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | String | No | Servidor | `8886561244:AAHAJ6...` | Token de acceso provisto por `@BotFather` para la comunicación del bot. |
| `TELEGRAM_CHAT_ID` | String / Entero | No | Servidor | `6503346990` | Identificador único del chat o grupo receptor de notificaciones. |
| `NEXT_PUBLIC_TELEGRAM_BOT_NAME` | String | No | Cliente / Servidor | `informatica_tdo_bot` | Nombre de usuario público del bot de Telegram. |
| `MAX_WS_CONNECTIONS` | Entero | No | Servidor | `100` | Límite máximo de conexiones concurrentes para sockets / polling. |

---

## 3. Validación en Tiempo de Ejecución

El proyecto incluye un validador automático en [`src/lib/config.ts`](file:///home/mario-dev/Documents/projects/clownfish-project/src/lib/config.ts). Si el servidor intenta iniciar y falta alguna de las variables marcadas como **Requeridas**, registrará un error en consola indicando exactamente qué variables deben ser provistas antes de aceptar solicitudes HTTP.
