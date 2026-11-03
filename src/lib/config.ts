export const config = {
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL as string,
  },
  minio: {
    endpoint: process.env.MINIO_STORAGE_ENDPOINT as string,
    accessKey: process.env.MINIO_STORAGE_ACCESS_KEY as string,
    secretKey: process.env.MINIO_STORAGE_SECRET_KEY as string,
    bucket: process.env.MINIO_STORAGE_MEDIA_BUCKET_NAME as string,
    useHttps: String(process.env.MINIO_STORAGE_USE_HTTPS).toLowerCase() === 'true',
  },
  db: {
    auth: {
      host: process.env.DB_AUTH_HOST as string,
      port: parseInt((process.env.DB_AUTH_PORT as string) || '3306', 10),
      user: process.env.DB_AUTH_USER as string,
      password: process.env.DB_AUTH_PASSWORD as string,
      name: process.env.DB_AUTH_NAME as string,
    },
  },
  auth: {
    jwtSecret: process.env.JWT_TOKEN_SECRET as string,
  },
};

export const getMissingVariables = (): string[] => {
  const missing: string[] = [];

  if (!config.db.auth.host) missing.push('DB_AUTH_HOST');
  if (!config.db.auth.password) missing.push('DB_AUTH_PASSWORD');
  if (!config.db.auth.user) missing.push('DB_AUTH_USER');
  if (!config.db.auth.name) missing.push('DB_AUTH_NAME');
  if (!config.auth.jwtSecret) missing.push('JWT_TOKEN_SECRET');

  if (missing.length > 0) {
    const errorMsg = `[Configuración] Faltan las siguientes variables de entorno: ${missing.join(', ')}`;
    console.error('\n=======================================================');
    console.error('ALERTA CRÍTICA DE CONFIGURACIÓN');
    console.error(errorMsg);
    console.error('=======================================================\n');
  }

  return missing;
};

if (typeof window === 'undefined') {
  getMissingVariables();
}
