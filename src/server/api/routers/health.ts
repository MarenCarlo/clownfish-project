import { createTRPCRouter, publicProcedure } from '../trpc';

export const healthRouter = createTRPCRouter({
  check: publicProcedure.query(() => {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }),
});
