const request = require('supertest');
const app = require('../../src/server');
const { User } = require('../../src/models');

describe('Authentication API', () => {
  beforeEach(async () => {
    // Clean up test data
    await User.destroy({ where: { email: 'test@example.com' } });
  });

  afterAll(async () => {
    await User.destroy({ where: { email: 'test@example.com' } });
  });

  test('POST /api/auth/register should create a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'donor'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.user).toHaveProperty('user_id');
    expect(response.body.tokens).toHaveProperty('accessToken');
  });

  test('POST /api/auth/login should authenticate user', async () => {
    // First register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'donor'
      });

    // Then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.tokens).toHaveProperty('accessToken');
  });

  test('POST /api/auth/login should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
  });
});

