import supertest from 'supertest';
import app from './utils/testServer';
import { prisma } from '@parel/db/src/client';

// TODO: Mock authentication middleware to inject testUser.id into sessions

describe('Flow E2E Tests', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let testUser: any;
  let leaf: any;
  let q1: any;
  let q2: any;

  beforeAll(async () => {
    request = supertest(app);
    // Clean up existing data
    await prisma.userQuestion.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.sssCategory.deleteMany({});
    await prisma.user.deleteMany({});

    // Seed a test user
    testUser = await prisma.user.create({ data: { email: 'e2e@flow.test', name: 'E2E User' } });
    // Seed a leaf (SSSC)
    leaf = await prisma.sssCategory.create({ data: { name: 'Leaf1', subSubCategoryId: '' } });
    // Seed two questions under the leaf
    q1 = await prisma.question.create({ data: { text: 'Question 1', ssscId: leaf.id } });
    q2 = await prisma.question.create({ data: { text: 'Question 2', ssscId: leaf.id } });

    // TODO: Stub auth middleware to use testUser.id
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should fetch next question and then answer and skip', async () => {
    // Fetch next
    const res1 = await request.get(`/api/flow/${leaf.id}/next`);
    expect(res1.status).toBe(200);
    expect(res1.body.id).toBe(q1.id);

    // Answer first question
    const res2 = await request.post(`/api/flow/${q1.id}/answer`);
    expect(res2.status).toBe(200);
    expect(res2.body.status).toBe('answered');

    // Fetch next again
    const res3 = await request.get(`/api/flow/${leaf.id}/next`);
    expect(res3.status).toBe(200);
    expect(res3.body.id).toBe(q2.id);

    // Skip second question
    const res4 = await request.post(`/api/flow/${q2.id}/skip`);
    expect(res4.status).toBe(200);
    expect(res4.body.status).toBe('skipped');

    // No more questions
    const res5 = await request.get(`/api/flow/${leaf.id}/next`);
    expect(res5.status).toBe(204);
  });
});
