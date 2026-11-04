import { createTRPCRouter } from '../trpc';
import { greetingRouter } from './greeting';
import { healthRouter } from './health';
import { productsRouter } from './products';

export const appRouter = createTRPCRouter({
  greeting: greetingRouter,
  health: healthRouter,
  products: productsRouter,
});

export type AppRouter = typeof appRouter;
