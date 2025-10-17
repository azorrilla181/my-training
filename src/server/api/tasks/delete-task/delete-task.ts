import { z } from 'zod/v4';
import { prisma } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { rethrowKnownPrismaError } from '../../../utils/prisma';

const deleteTaskInput = z.object({
  taskId: z.string(),
});

const deleteTaskOutput = z.void();

export const deleteTask = authorizedProcedure
  .meta({ requiredPermissions: ['manage-tasks'] })
  .input(deleteTaskInput)
  .output(deleteTaskOutput)
  .mutation(async opts => {
    // Your logic goes here
    try {
      await prisma.task.delete({
        where: {
          id: opts.input.taskId,
          ownerId: opts.ctx.userId,
        },
      });
    } catch (error) {
      rethrowKnownPrismaError(error);
      throw error;
    }
  });