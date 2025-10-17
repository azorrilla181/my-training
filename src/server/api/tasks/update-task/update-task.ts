import { z } from 'zod/v4';
import { prisma, TaskStatus } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { rethrowKnownPrismaError } from '../../../utils/prisma';

const updateTaskInput = z.object({
  taskId: z.string(),
  newTitle: z.optional(z.string()),
  newDescription: z.optional(z.string()),
  newStatus: z.optional(z.literal(Object.values(TaskStatus))),
});

const updateTaskOutput = z.object({
  status: z.literal(Object.values(TaskStatus)),
  id: z.string(),
  title: z.string(),
  description: z.string(),
  completedAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  createdAt: z.date().nullable(),
  ownerId: z.string(),
});

export const updateTask = authorizedProcedure
  .meta({ requiredPermissions: ['manage-tasks'] })
  .input(updateTaskInput)
  .output(updateTaskOutput)
  .mutation(async opts => {
    // // Your logic goes here
    try {
      const oldTask = await prisma.task.findUniqueOrThrow({
        where: { id: opts.input.taskId, ownerId: opts.ctx.userId },
      });

      let calculatedCompletedAt: Date | null = oldTask.completedAt;
      if (opts.input.newStatus) {
        if (opts.input.newStatus != oldTask.status) {
          // if task is switched to "complete"
          if (opts.input.newStatus === 'Complete') {
            calculatedCompletedAt = new Date();
          } else if (oldTask.status === 'Complete') {
            calculatedCompletedAt = null;
          }
        }
      }

      return await prisma.task.update({
        where: {
          id: oldTask.id,
          ownerId: opts.ctx.userId,
        },
        data: {
          title: opts.input.newTitle?.trim(),
          description: opts.input.newDescription,
          status: opts.input.newStatus,
          completedAt: calculatedCompletedAt,
        },
      });
    } catch (error) {
      rethrowKnownPrismaError(error);
      throw error;
    }
  });
