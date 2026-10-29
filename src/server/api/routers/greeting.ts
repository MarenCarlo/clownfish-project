import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const greetingRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ name: z.string().min(1).default('Mundo') }))
    .query(({ input }) => {
      return {
        greeting: `¡Hola, ${input.name}!`,
        timestamp: new Date().toISOString(),
      };
    }),

  sendFeedback: publicProcedure
    .input(
      z.object({
        message: z.string().min(3, 'El mensaje debe tener al menos 3 caracteres'),
        author: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      return {
        success: true,
        message: `Feedback recibido: "${input.message}"`,
        author: input.author ?? 'Anónimo',
        receivedAt: new Date().toISOString(),
      };
    }),
});
