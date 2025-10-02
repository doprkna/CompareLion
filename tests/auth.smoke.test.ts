import supertest from 'supertest';
import app from './utils/testServer';
import { prisma } from '@parel/db/src/client';

const request = supertest(app);

describe('Auth Smoke Tests', () => {
  const email = 'smoke@example.com';
  const password = 'testpass';
  let cookie: string;

  beforeAll(async () => {
    // Clean up any existing user
    await prisma.user.deleteMany({ where: { email } });
  });

  it('should signup a new user', async () => {
    const res = await request
      .post('/api/auth/signup')
      .send({ email, password });
    expect(res.status).toBe(200);
    const setCookie = res.header['set-cookie'];
    expect(setCookie).toBeDefined();
    cookie = setCookie;
  });

  it('should reject login with wrong password', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('should login successfully', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email, password });
    expect(res.status).toBe(200);
    const setCookie = res.header['set-cookie'];
    expect(setCookie).toBeDefined();
    cookie = setCookie;
  });

  it('should allow access to protected flow endpoint with token', async () => {
    // Create a leaf to test
    const leaf = await prisma.sssCategory.create({ data: { name: 'SmokeLeaf', subSubCategoryId: '' } });
    const res = await request
      .get(`/api/flow/${leaf.id}/next`)
      .set('Cookie', cookie);
    // 204 No Content if no questions
    expect([200, 204]).toContain(res.status);
  });
});
