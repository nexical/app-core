import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../../../src/pages/api/schema';
import { ModuleDiscovery } from '../../../../src/lib/modules/module-discovery';
import { generateDocs } from '../../../../src/lib/api/api-docs';

// Mock dependencies
vi.mock('../../../../src/lib/modules/module-discovery', () => ({
  ModuleDiscovery: {
    loadModules: vi.fn(),
  },
}));

vi.mock('../../../../src/lib/api/api-docs', () => ({
  generateDocs: vi.fn(),
}));

vi.mock('../../../../src/lib/core/config', () => ({
  config: {
    PUBLIC_SITE_NAME: 'Test Site',
    PUBLIC_SITE_VERSION: '1.0.0',
    PUBLIC_API_DESCRIPTION: 'Test API',
  },
}));

describe('API Schema Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates openapi schema correctly', async () => {
    // Setup mocks
    const mockModules = [{ id: 'mod1' }, { id: 'mod2' }];
    vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue(mockModules as any);

    vi.mocked(generateDocs).mockImplementation(async (module: any) => {
      if (module.id === 'mod1') return { '/path1': { get: {} } };
      if (module.id === 'mod2') return { '/path2': { post: {} } };
      return {};
    });

    const mockContext = {
      locals: {
        actor: { id: 'user1' },
      },
    };

    const response = await GET(mockContext as any);

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const data = await response.json();

    // Check basic info
    expect(data.openapi).toBe('3.0.0');
    expect(data.info.title).toBe('Test Site');
    expect(data.info.version).toBe('1.0.0');

    // Check paths merging
    expect(data.paths).toEqual({
      '/path1': { get: {} },
      '/path2': { post: {} },
    });

    // Verify calls
    expect(ModuleDiscovery.loadModules).toHaveBeenCalled();
    expect(generateDocs).toHaveBeenCalledTimes(2);
    expect(generateDocs).toHaveBeenCalledWith(mockModules[0], mockContext.locals.actor);
    expect(generateDocs).toHaveBeenCalledWith(mockModules[1], mockContext.locals.actor);
  });
});
