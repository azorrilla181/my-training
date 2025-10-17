import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, TaskStatus, User } from '../../../../../prisma/client';

describe('Delete task', () => {
  let requestingUser: User;
  let deleteTask: ReturnType<
    typeof appRouter.createCaller
  >['tasks']['deleteTask'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-tasks'],
      }),
    });
    deleteTask = appRouter.createCaller({ userId: requestingUser.id }).tasks
      .deleteTask;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });

  // deleteTask function
  it('deletes the task', async () => {
    const task = await prisma.task.create({
      data: {
        ownerId: requestingUser.id,
        title: faker.book.title(),
        description: faker.hacker.phrase(),
        status: faker.helpers.enumValue(TaskStatus),
        completedAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
        createdAt: faker.date.past(),
      },
    });

    try {
      await deleteTask({ taskId: task.id });
      const foundTask = await prisma.task.findUnique({
        where: {
          id: task.id,
        },
      });
      expect(foundTask).toBeNull();
    } catch (err) {
      await prisma.task.delete({
        where: {
          id: task.id,
        },
      });
      throw err;
    }
  });

  it('error NOT_FOUND if task does not exist', async () => {
    let error;

    try {
      await deleteTask({
        taskId: faker.string.uuid(),
      });
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error).toHaveProperty('code', 'NOT_FOUND');
  });
});