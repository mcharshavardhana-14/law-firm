// Test setup file
import { sequelize } from '../config/database';

// Setup before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Initialize test database if needed
  // await sequelize.sync({ force: true });
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connections
  await sequelize.close();
});

// Clear database between tests
beforeEach(async () => {
  // Optional: Clear tables between tests
});
