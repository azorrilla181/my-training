import { object, z } from 'zod/v4';
import { prisma, TaskStatus } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { title } from 'process';

const getTasksByUserInput = z.object({
  pageSize: z.number(),
  pageOffset: z.number(),
});

const getTasksByUserOutput = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      completedAt: z.date().nullable(),
      updatedAt: z.date().nullable(),
      createdAt: z.date().nullable(),
      ownerId: z.string(),
      status: z.literal(Object.values(TaskStatus)),
    })
  ),
  totalCount: z.number(),
});

export const getTasksByUser = authorizedProcedure
  .meta({ requiredPermissions: ['manage-tasks'] })
  .input(getTasksByUserInput)
  .output(getTasksByUserOutput)
  .mutation(
    async (opts: {
      ctx: { userId: any };
      input: { pageSize: any; pageOffset: any };
    }) => {
      // Your logic goes here
      const totalCount = await prisma.task.count({
        where: { ownerId: opts.ctx.userId },
      });

      if (opts.input.pageOffset && opts.input.pageOffset >= totalCount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot paginate to item ${opts.input.pageOffset + 1}, as there are only ${totalCount} items`,
        });
      }

      const data = await prisma.task.findMany({
        where: { ownerId: opts.ctx.userId },
        take: opts.input.pageSize,
        skip: opts.input.pageOffset,
        orderBy: { createdAt: 'desc' },
      });

      return { data, totalCount };
    }
  );