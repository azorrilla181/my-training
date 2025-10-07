import { object, z } from 'zod/v4';
import { prisma, taskStatus } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';
import { TRPCError } from "@trpc/server";
import { title } from 'process';

const getTasksByUserInput = z.object({
  pageSize: z.number(),
  pageOffset: z.number(),
});

const getTasksByUserOutput = z.object({
  data: z.array(z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    title: z.string(),
    description: z.string(),
    completedAt: z.date().nullable(),
    ownerId: z.string(),

    status: z.literal(Object.values(taskStatus)),
  })),
  totalCount: z.number(),
});

export const getTasksByUser = authorizedProcedure
  .meta({ requiredPermissions: [] })
  .input(getTasksByUserInput)
  .output(getTasksByUserOutput)
  .mutation(async (opts) => {
    // Your logic goes here
    throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
  });
