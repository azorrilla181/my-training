// Remember that procedures are single API Endpoints
// To break them down, they are callable functions in the router with a 
//   I/O contract (input and output)
//   handlers or all the logic it needs for the CRUD to work
//   and even though optional, middleware is important for security since we don't want every user to see everything or has access to everything in the app
//   path

import { z } from 'zod/v4';
import { prisma } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';

const createTaskInput = z.object({
  title: z.string(),
  description: z.string(),
});

const createTaskOutput = z.object({
  taskId: z.string(), 
});

export const createTask = authorizedProcedure
  .meta({ requiredPermissions: ['manage-tasks'] })
  .input(createTaskInput)
  .output(createTaskOutput)
  .mutation(async (opts) => {
      const task = await prisma.task.create({
        data: {
          title: opts.input.title,
          description: opts.input.description,
          ownerId: opts.ctx.userId, 
        },
      });

      return { taskId: task.id}
  });
