import * as Minio from 'minio';
import { config } from '@/lib/config';

const endpointConfig = config.minio.endpoint || 'localhost';
const [endPoint, portStr] = endpointConfig.split(':');
const port = portStr ? parseInt(portStr, 10) : undefined;

const useSSL = config.minio.useHttps;

export const minioClient = new Minio.Client({
  endPoint: endPoint || 'localhost',
  port,
  useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
});

export const bucketName = config.minio.bucket;

/**
 * Sube un archivo a MinIO y devuelve su URL pública.
 */
export async function uploadFileToMinio(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const metaData = {
    'Content-Type': mimeType,
  };

  await minioClient.putObject(bucketName, fileName, buffer, buffer.length, metaData);

  const protocol = useSSL ? 'https' : 'http';
  const portPart = port ? `:${port}` : '';
  return `${protocol}://${endPoint}${portPart}/${bucketName}/${fileName}`;
}

/**
 * Elimina un archivo de MinIO a partir de su URL pública o nombre de objeto.
 */
export async function deleteFileFromMinio(fileUrlOrName: string): Promise<boolean> {
  try {
    if (!fileUrlOrName || typeof fileUrlOrName !== 'string') {
      return false;
    }

    let objectName = fileUrlOrName.trim();

    // Si viene la URL completa, extraer el path relativo dentro del bucket
    if (objectName.includes(`/${bucketName}/`)) {
      const parts = objectName.split(`/${bucketName}/`);
      objectName = parts[1] ?? '';
    } else if (objectName.startsWith('http://') || objectName.startsWith('https://')) {
      try {
        const urlObj = new URL(objectName);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts[0] === bucketName) {
          objectName = pathParts.slice(1).join('/');
        } else {
          objectName = pathParts.join('/');
        }
      } catch {
        // En caso de formato de URL no estándar
      }
    }

    if (!objectName) {
      return false;
    }

    await minioClient.removeObject(bucketName, objectName);
    return true;
  } catch (error) {
    console.warn('[MinIO Warning] No se pudo eliminar el archivo:', error);
    return false;
  }
}
