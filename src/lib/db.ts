import mysql, { type Pool } from 'mysql2/promise';
import { config } from '@/lib/config';

declare global {
  var _authDbPool: Pool | undefined;
}

// ==========================================
// DB: Auth & Users (oasis_one)
// ==========================================
export const authDb =
  globalThis._authDbPool ||
  mysql.createPool({
    host: config.db.auth.host,
    port: config.db.auth.port,
    user: config.db.auth.user,
    password: config.db.auth.password,
    database: config.db.auth.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis._authDbPool = authDb;
}
