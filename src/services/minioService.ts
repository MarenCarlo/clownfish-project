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
