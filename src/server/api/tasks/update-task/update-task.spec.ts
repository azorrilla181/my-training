import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, TaskStatus, User } from '../../../../../prisma/client';

describe('Update task', () => {
  let requestingUser: User;
  let updateTask: ReturnType<
    typeof appRouter.createCaller
  >['tasks']['updateTask'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-tasks'],
        roles: [],
      }),
    });
    updateTask = appRouter.createCaller({ userId: requestingUser.id }).tasks
      .updateTask;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });
  // updateTask function

  it('it updates the task when set to complete', async () => {
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
      const title = faker.book.title();
      const description = faker.commerce.productDescription();
      const status: TaskStatus = 'Complete';

      const updatedTask = await updateTask({
        taskId: task.id,
        newTitle: title,
        newDescription: description,
        newStatus: status,
      });

      expect(updatedTask).toBeDefined();
      expect(updatedTask.title).toBe(title);
      expect(updatedTask.description).toBe(description);
      expect(updatedTask.status).toBe(status);
      expect(updatedTask.completedAt).toBeInstanceOf(Date);
    } finally {
      await prisma.task.delete({
        where: {
          id: task.id,
        },
      });
    }
  });

  it('updates the task when taken off complete', async () => {
    const task = await prisma.task.create({
      data: {
        ownerId: requestingUser.id,
        title: faker.book.title(),
        description: faker.hacker.phrase(),
        status: 'Complete',
        completedAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
        createdAt: faker.date.past(),
      },
    });

    try {
      const title = faker.book.title();
      const description = faker.commerce.productDescription();
      const status: TaskStatus = 'Incomplete';

      const updatedTask = await updateTask({
        taskId: task.id,
        newTitle: title,
        newDescription: description,
        newStatus: status,
      });

      expect(updatedTask).toBeDefined();
      expect(updatedTask.title).toBe(title);
      expect(updatedTask.description).toBe(description);
      expect(updatedTask.status).toBe(status);
      expect(updatedTask.completedAt).toBeNull();
    } finally {
      await prisma.task.delete({
        where: {
          id: task.id,
        }
      });
    }
  });

  it('error NOT_FOUND if task is not found', async () => {
    let error;

    try {
      await updateTask({
        taskId: faker.string.uuid(),
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error).toHaveProperty('code', 'NOT_FOUND');
  });
});