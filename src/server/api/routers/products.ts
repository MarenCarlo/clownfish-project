import { z } from 'zod';
import crypto from 'crypto';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { clownfishDb } from '@/lib/db';
import { uploadFileToMinio, deleteFileFromMinio } from '@/services/minioService';
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
export type DepartmentOption = CatalogOption;
export interface MunicipalityOption extends CatalogOption {
  departmentId: string;
}

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

  getDepartments: publicProcedure.query(async (): Promise<DepartmentOption[]> => {
    try {
      const [rows] = await clownfishDb.execute<RowDataPacket[]>(
        `SELECT id, code, nombre as label, display_order
         FROM tb_departamentos
         WHERE is_active = 1
         ORDER BY display_order ASC, nombre ASC`
      );

      return rows.map((row, idx) => ({
        id: String(row.id),
        code: String(row.code),
        label: String(row.label),
        value: String(row.id),
        displayOrder: Number(row.display_order ?? idx + 1),
      }));
    } catch {
      return [];
    }
  }),

  getMunicipalities: publicProcedure
    .input(
      z.object({
        departmentId: z.string().optional(),
      })
    )
    .query(async ({ input }): Promise<MunicipalityOption[]> => {
      if (!input.departmentId) return [];

      try {
        const [rows] = await clownfishDb.execute<RowDataPacket[]>(
          `SELECT id, departamento_id, code, nombre as label, display_order
           FROM tb_municipios
           WHERE is_active = 1 AND departamento_id = ?
           ORDER BY display_order ASC, nombre ASC`,
          [input.departmentId]
        );

        return rows.map((row, idx) => ({
          id: String(row.id),
          departmentId: String(row.departamento_id),
          code: String(row.code),
          label: String(row.label),
          value: String(row.id),
          displayOrder: Number(row.display_order ?? idx + 1),
        }));
      } catch {
        return [];
      }
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

      // 2. Extraer las 4 claves maestras para verificar si el producto ya existe
      const barras = String(input.barras ?? input.product_barcode ?? '').trim();
      const empresaProductoId = String(
        input.empresa_producto_id ?? input.empresa_producto ?? input.product_store ?? ''
      ).trim();
      const departamentoId = String(
        input.departamento_id ?? input.departamento ?? input.product_department ?? ''
      ).trim();
      const municipioId = String(
        input.municipio_id ?? input.municipio ?? input.product_municipality ?? ''
      ).trim();

      // Consultar si ya existe un producto activo con esas 4 llaves
      let existingProduct: {
        id: string;
        nombre: string;
        precio: number;
        en_oferta: number;
        foto: string;
        observaciones: string | null;
      } | null = null;

      if (barras && empresaProductoId && departamentoId && municipioId) {
        const [existingRows] = await clownfishDb.execute<RowDataPacket[]>(
          `SELECT id, nombre, precio, en_oferta, foto, observaciones
           FROM tb_products
           WHERE barras = ?
             AND empresa_producto_id = ?
             AND departamento_id = ?
             AND municipio_id = ?
             AND is_active = 1
           LIMIT 1`,
          [barras, empresaProductoId, departamentoId, municipioId]
        );

        if (existingRows.length > 0) {
          const row = existingRows[0]!;
          existingProduct = {
            id: String(row.id),
            nombre: String(row.nombre),
            precio: Number(row.precio),
            en_oferta: Number(row.en_oferta ?? 0),
            foto: String(row.foto ?? ''),
            observaciones: row.observaciones ? String(row.observaciones) : null,
          };
        }
      }

      // 3. Procesar las columnas definidas en el schema
      const dbRecord: Record<string, unknown> = {};

      for (const field of productFormSchema.fields) {
        const key = field.name || field.id;
        const dbCol = field.dbColumn || field.name;
        if (!dbCol) continue;

        const val = input[dbCol] !== undefined ? input[dbCol] : input[key];

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

              // Si el producto ya existía y tenía una foto anterior, la eliminamos para evitar archivos basura
              if (existingProduct?.foto) {
                await deleteFileFromMinio(existingProduct.foto);
              }

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
          } else if (existingProduct?.foto) {
            // Si el producto ya existe y no se adjuntó nueva foto, conservamos la actual
            dbRecord[dbCol] = existingProduct.foto;
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
        } else if (field.type === 'checkbox') {
          if (Array.isArray(val)) {
            if (dbCol === 'en_oferta') {
              dbRecord[dbCol] = val.includes('oferta') || val.length > 0 ? 1 : 0;
            } else {
              dbRecord[dbCol] = JSON.stringify(val);
            }
          } else if (typeof val === 'boolean') {
            dbRecord[dbCol] = val ? 1 : 0;
          } else if (typeof val === 'number') {
            dbRecord[dbCol] = val === 1 ? 1 : 0;
          } else if (typeof val === 'string' && val.trim().length > 0) {
            dbRecord[dbCol] =
              val.trim() === 'oferta' || val.trim() === 'true' || val.trim() === '1' ? 1 : 0;
          } else {
            if (field.validation?.required) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `${field.label} es obligatorio.`,
              });
            }
            dbRecord[dbCol] = 0;
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

      // 4. Operaciones en base de datos bajo transacción
      const connection = await clownfishDb.getConnection();
      try {
        await connection.beginTransaction();

        if (existingProduct) {
          // Caso A: El producto ya existe para esas 4 llaves maestras
          const productId = existingProduct.id;

          // 1. Actualizar tb_products con los datos vigentes (precio, en_oferta, foto, observaciones)
          await connection.execute<ResultSetHeader>(
            `UPDATE tb_products
             SET precio = ?,
                 en_oferta = ?,
                 foto = ?,
                 observaciones = ?,
                 updated_at = NOW()
             WHERE id = ?`,
            [
              Number(dbRecord.precio),
              Number(dbRecord.en_oferta ?? 0),
              String(dbRecord.foto ?? ''),
              dbRecord.observaciones ? String(dbRecord.observaciones) : null,
              productId,
            ]
          );

          // 2. Insertar nuevo registro en el historial de precios
          await connection.execute<ResultSetHeader>(
            `INSERT INTO tb_product_price_history (
               id, product_id, precio, en_oferta, observaciones, oasis_one_user_id
             ) VALUES (UUID(), ?, ?, ?, ?, ?)`,
            [
              productId,
              Number(dbRecord.precio),
              Number(dbRecord.en_oferta ?? 0),
              dbRecord.observaciones ? String(dbRecord.observaciones) : null,
              oasisOneUserId,
            ]
          );

          await connection.commit();

          return {
            success: true,
            isNewProduct: false,
            productId,
            message:
              'El producto ya existe en esta ubicación. Se ha registrado un nuevo precio en el historial.',
          };
        } else {
          // Caso B: Producto nuevo -> Se inserta en tb_products y se inicializa su historial
          const productId = crypto.randomUUID();

          const extraColumns: Record<string, unknown> = {
            id: productId,
            oasis_one_user_id: oasisOneUserId,
            created_by_username: createdByUsername,
            is_active: 1,
          };

          const tableName = productFormSchema.dbTable || 'tb_products';
          const { sql, params } = buildDynamicInsertSql(tableName, dbRecord, extraColumns);

          await connection.execute<ResultSetHeader>(
            sql,
            params as (string | number | boolean | Date | null | Buffer)[]
          );

          // Registro inicial en el historial de precios
          await connection.execute<ResultSetHeader>(
            `INSERT INTO tb_product_price_history (
               id, product_id, precio, en_oferta, observaciones, oasis_one_user_id
             ) VALUES (UUID(), ?, ?, ?, ?, ?)`,
            [
              productId,
              Number(dbRecord.precio),
              Number(dbRecord.en_oferta ?? 0),
              dbRecord.observaciones ? String(dbRecord.observaciones) : null,
              oasisOneUserId,
            ]
          );

          await connection.commit();

          return {
            success: true,
            isNewProduct: true,
            productId,
            message: 'Producto registrado con éxito.',
          };
        }
      } catch (dbErr: unknown) {
        await connection.rollback();
        console.error('[DB Operation Error]:', dbErr);
        const errMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Error al procesar el producto en base de datos: ${errMsg}`,
        });
      } finally {
        connection.release();
      }
    }),
});
