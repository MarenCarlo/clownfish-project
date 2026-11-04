import mysql, { type Pool } from 'mysql2/promise';
import { config } from '@/lib/config';

declare global {
  var _authDbPool: Pool | undefined;
  var _clownfishDbPool: Pool | undefined;
}

// ==========================================
// DB 1: Auth & Users (oasis_one)
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

// ==========================================
// DB 2: Clownfish Products (ClownfishDB)
// ==========================================
export const clownfishDb =
  globalThis._clownfishDbPool ||
  mysql.createPool({
    host: config.db.clownfish.host,
    port: config.db.clownfish.port,
    user: config.db.clownfish.user,
    password: config.db.clownfish.password,
    database: config.db.clownfish.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis._clownfishDbPool = clownfishDb;
}
