import request from 'supertest';
import app from '../../server';
import { Project, CaseType, User } from '../../models/postgres';

describe('Project API Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let caseTypeId: string;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'senior_partner',
      status: 'active',
      loginAttempts: 0,
      mfaEnabled: false,
    });
    userId = user.id;

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.data.token;

    // Create test case type
    const caseType = await CaseType.create({
      name: 'Civil Cases',
      description: 'Civil law cases',
      relevantLegalActs: ['CPC'],
      customFields: {},
    });
    caseTypeId = caseType.id;
  });

  afterAll(async () => {
    // Cleanup
    await Project.destroy({ where: {} });
    await CaseType.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          caseTypeId,
          caseNumber: '2024/CIV/001',
          caseTitle: 'Test Case',
          clientNames: ['John Doe'],
          opposingParties: ['Jane Smith'],
          status: 'active',
          priority: 'high',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.project).toHaveProperty('id');
      expect(response.body.data.project.caseNumber).toBe('2024/CIV/001');
    });

    it('should return error for duplicate case number', async () => {
      // Create first project
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          caseTypeId,
          caseNumber: '2024/CIV/002',
          caseTitle: 'Test Case',
          clientNames: ['John Doe'],
          opposingParties: ['Jane Smith'],
        });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          caseTypeId,
          caseNumber: '2024/CIV/002',
          caseTitle: 'Another Case',
          clientNames: ['John Doe'],
          opposingParties: ['Jane Smith'],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          caseTypeId,
          caseNumber: '2024/CIV/003',
          caseTitle: 'Test Case',
          clientNames: ['John Doe'],
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/projects', () => {
    it('should get all projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.projects)).toBe(true);
    });

    it('should filter projects by status', async () => {
      const response = await request(app)
        .get('/api/projects?status=active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
