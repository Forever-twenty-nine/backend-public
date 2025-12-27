/* eslint-env jest */
// Setup file executed before test suites
// Mock the database connection to avoid opening real connections during unit/integration tests
jest.mock('@/config/databases', () => ({
  __esModule: true,
  default: {
    model: () => ({
      // minimal model stub to avoid errors if any code calls model methods during tests
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOneAndUpdate: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
      countDocuments: jest.fn(),
    }),
  },
}));

// Optional: please ensure global setup/teardown to close any handles if required
afterAll(() => {
  // noop by default. Add explicit tear-down if your tests open connections.
});

// (removed debug handler)

// Mock 'uuid' to avoid ESM parsing issues in Jest environment
jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

// Mock mongoose globally
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  Types: {
    ObjectId: {
      isValid: jest.fn((id: string) => id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)),
    },
  },
  model: jest.fn(),
}));

// Mock app config globally to avoid referencing `import.meta` in tests
jest.mock('@/config', () => ({
  NODE_ENV: 'test',
  BASE_URL: '/api',
  FRONTEND_DOMAIN: '',
  EMAIL_FROM: 'test@example.com',
  EMAIL_PASSWORD: 'test',
  EMAIL_HOST: 'localhost',
  EMAIL_PORT: 587,
}));
