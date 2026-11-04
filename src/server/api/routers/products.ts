import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { clownfishDb } from '@/lib/db';
import { uploadFileToMinio } from '@/services/minioService';
import { getAuthUser } from '@/middlewares/auth';
import {
  productFormSchema,
  buildDynamicInsertSql,
  isSerializedFilePayload,
  type SerializedFilePayload,
} from '@/components/organisms/dynamic-form/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface CatalogOption {
  id: string;
  code: string;
  label: string;
  value: string;
  displayOrder: number;
}

export type GramajeUnitOption = CatalogOption;
export type CompanyOption = CatalogOption;

export const productsRouter = createTRPCRouter({
  getGramajeUnits: publicProcedure.query(async (): Promise<GramajeUnitOption[]> => {
    const [rows] = await clownfishDb.execute<RowDataPacket[]>(
      `SELECT id, code, label, display_order
       FROM tb_gramaje_units
       WHERE is_active = 1
       ORDER BY display_order ASC, label ASC`
    );

    return rows.map((row) => ({
      id: String(row.id),
      code: String(row.code),
      label: String(row.label),
      value: String(row.id),
      displayOrder: Number(row.display_order ?? 0),
    }));
  }),

  getCompanies: publicProcedure.query(async (): Promise<CompanyOption[]> => {
    const [rows] = await clownfishDb.execute<RowDataPacket[]>(
      `SELECT id, code, label
       FROM tb_companies
       WHERE is_active = 1
       ORDER BY label ASC`
    );

    return rows.map((row, idx) => ({
      id: String(row.id),
      code: String(row.code),
      label: String(row.label),
      value: String(row.id),
      displayOrder: idx + 1,
    }));
  }),

  /**
   * Guarda un producto construyendo dinámicamente el query INSERT
   * en base a las columnas definidas en el schema JSON (dbColumn / name).
   */
  createProduct: publicProcedure
    .input(z.record(z.string(), z.unknown()))
    .mutation(async ({ input }) => {
      // 1. Obtener usuario autenticado desde la cookie de sesión (oasis_one)
      const authUser = await getAuthUser();
      const userPayload =
        typeof authUser === 'object' && authUser !== null
          ? (authUser as Record<string, unknown>)
          : null;
      const oasisOneUserId = userPayload?.userId ? Number(userPayload.userId) : null;
      const createdByUsername = userPayload?.userName ? String(userPayload.userName) : null;

      // 2. Procesar las columnas definidas en el schema
      const dbRecord: Record<string, unknown> = {};

      for (const field of productFormSchema.fields) {
        const key = field.name || field.id;
        const dbCol = field.dbColumn || field.name;
        if (!dbCol) continue;

        const val = input[key];

        // Manejo especial de archivos (subida a MinIO si viene como payload serializado)
        if (field.type === 'file' || dbCol === 'foto') {
          if (isSerializedFilePayload(val)) {
            const filePayload = val as SerializedFilePayload;
            const buffer = Buffer.from(filePayload.base64, 'base64');
            const timestamp = Date.now();
            const safeName = filePayload.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
            const minioFileName = `products/${timestamp}_${safeName}`;

            try {
              const fileUrl = await uploadFileToMinio(
                buffer,
                minioFileName,
                filePayload.mimeType
              );
              dbRecord[dbCol] = fileUrl;
            } catch (uploadErr) {
              console.error('[MinIO Error]:', uploadErr);
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Error al subir la fotografía a almacenamiento.',
              });
            }
          } else if (typeof val === 'string' && val.trim().length > 0) {
            dbRecord[dbCol] = val.trim();
          } else {
            if (field.validation?.required) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `${field.label} es obligatorio.`,
              });
            }
            dbRecord[dbCol] = null;
          }
        } else if (field.type === 'number') {
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            const num = Number(String(val).trim());
            if (isNaN(num)) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `${field.label} debe ser un número válido.`,
              });
            }
            dbRecord[dbCol] = num;
          } else {
            if (field.validation?.required) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `${field.label} es obligatorio.`,
              });
            }
            dbRecord[dbCol] = null;
          }
        } else {
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            dbRecord[dbCol] = String(val).trim();
          } else {
            if (field.validation?.required) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `${field.label} es obligatorio.`,
              });
            }
            dbRecord[dbCol] = null;
          }
        }
      }

      // 3. Metadatos del sistema adicionales a insertar
      const extraColumns: Record<string, unknown> = {
        oasis_one_user_id: oasisOneUserId,
        created_by_username: createdByUsername,
        is_active: 1,
      };

      // 4. Construir dinámicamente la consulta INSERT con nombres de columnas y placeholders
      const tableName = productFormSchema.dbTable || 'tb_products';
      const { sql, params } = buildDynamicInsertSql(tableName, dbRecord, extraColumns);

      try {
        const [result] = await clownfishDb.execute<ResultSetHeader>(
          sql,
          params as (string | number | boolean | Date | null | Buffer)[]
        );
        return {
          success: true,
          message: 'Producto guardado con éxito.',
          affectedRows: result.affectedRows,
        };
      } catch (dbErr: unknown) {
        console.error('[DB Insert Error]:', dbErr);
        const errMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Error al guardar en base de datos: ${errMsg}`,
        });
      }
    }),
});
