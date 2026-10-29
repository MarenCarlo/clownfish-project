import 'server-only';
import { createCallerFactory } from '@/server/api/trpc';
import { appRouter } from '@/server/api/routers/_app';
import { createTRPCContext } from '@/server/api/context';

const createCaller = createCallerFactory(appRouter);

export async function trpcServer() {
  const ctx = await createTRPCContext();
  return createCaller(ctx);
}
