import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export interface CreateContextOptions {
  headers: Headers;
}

export async function createTRPCContext(opts?: Partial<FetchCreateContextFnOptions>) {
  return {
    headers: opts?.req?.headers ?? new Headers(),
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
