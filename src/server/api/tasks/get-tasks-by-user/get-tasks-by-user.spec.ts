import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import { TaskStatus, prisma, User } from '../../../../../prisma/client';
import { array } from 'zod/v4';
import { title } from 'process';

describe('Get tasks by user', () => {
  let requestingUser: User;
  let getTasksByUser: ReturnType<
    typeof appRouter.createCaller
  >['tasks']['getTasksByUser'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: [],
      }),
    });
    getTasksByUser = appRouter.createCaller({ userId: requestingUser.id }).tasks
      .getTasksByUser;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });
  it('gets the tasks', async () => {
    const total = 5;
    const pageSize = 3;
    const tasks = await prisma.task.createManyAndReturn({
      data: Array.from({ length: total }, () => ({
        ownerId: requestingUser.id,
        title: faker.book.title(),
        description: faker.hacker.phrase(),
        status: faker.helpers.enumValue(TaskStatus),
        completedAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
        createdAt: faker.date.past(),
      })),
    });
    try {
      const retrievedTasks = await getTasksByUser({ pageSize, pageOffset: 0 });

      expect(retrievedTasks).toBeDefined();
      expect(retrievedTasks).toHaveProperty('totalCount', total);
      expect(retrievedTasks.data.length).toBe(pageSize);
    } finally {
      await prisma.task.deleteMany({
        where: {
          id: {
            in: tasks.map(task => task.id),
          },
        },
      });
    }
  });
});
