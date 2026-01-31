import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use a hoisted mock for easy reference
const mocks = vi.hoisted(() => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  })),
  Pool: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    connect: vi.fn(),
  })),
  PrismaPg: vi.fn().mockImplementation(() => ({})),
}));

// Use specific mock types to avoid 'any'
type MockPool = typeof mocks.Pool;
type MockPrismaClient = typeof mocks.PrismaClient;
type MockPrismaPg = typeof mocks.PrismaPg;

// Mock pg specifically as a class that returns our mocked object
vi.mock('pg', () => {
  return {
    Pool: function (this: unknown) {
      return (mocks.Pool as MockPool)();
    },
  };
});

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: function (this: unknown) {
      return (mocks.PrismaClient as MockPrismaClient)();
    },
  };
});

vi.mock('@prisma/adapter-pg', () => {
  return {
    PrismaPg: function (this: unknown) {
      return (mocks.PrismaPg as MockPrismaPg)();
    },
  };
});

describe('Core DB', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
  });

  it('should initialize successfully', async () => {
    const { db } = await import('../../../../src/lib/core/db');
    expect(db).toBeDefined();
    expect(mocks.Pool).toHaveBeenCalled();
    expect(mocks.PrismaPg).toHaveBeenCalled();
    expect(mocks.PrismaClient).toHaveBeenCalled();
  });

  it('should use global instance', async () => {
    const mockInstance = { isMock: true };
    // Use unknown then cast to access global variables
    (globalThis as unknown as Record<string, unknown>).prisma_db_v1 = mockInstance;
    const { db } = await import('../../../../src/lib/core/db');
    expect(db).toBe(mockInstance);
    delete (globalThis as unknown as Record<string, unknown>).prisma_db_v1;
  });

  it('should not set global instance in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    process.env.NODE_ENV = 'production'; // redundant but ensuring

    await import('../../../../src/lib/core/db');
    expect((globalThis as unknown as Record<string, unknown>).prisma_db_v1).toBeUndefined();

    vi.unstubAllEnvs();
  });
});
