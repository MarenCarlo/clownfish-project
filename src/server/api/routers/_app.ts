import { createTRPCRouter } from '../trpc';
import { greetingRouter } from './greeting';
import { healthRouter } from './health';

export const appRouter = createTRPCRouter({
  greeting: greetingRouter,
  health: healthRouter,
});

export type AppRouter = typeof appRouter;
