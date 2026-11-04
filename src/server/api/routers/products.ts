import { createTRPCRouter, publicProcedure } from '../trpc';
import { clownfishDb } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

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
});
