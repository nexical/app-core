import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyService } from ' @/services/my-service';
import { HookSystem } from ' @/lib/modules/hooks';
import { db } from ' @/lib/core/db';
import type { ServiceResponse } from ' @/types/service';

// Mock dependencies
vi.mock(' @/lib/core/db', () => ({
  db: {
    myModel: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock(' @/lib/modules/hooks', () => ({
  HookSystem: {
    dispatch: vi.fn(),
    filter: vi.fn((event, data) => Promise.resolve(data)),
  },
}));

describe('MyService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create item and dispatch event', async () => {
    // Arrange
    const input = { name: 'Test Item' };
    const mockCreated = { id: '1', ...input };
    (db.myModel.create as any).mockResolvedValue(mockCreated);

    // Act
    const result = await MyService.create(input);

    // Assert: ServiceResponse Wrapper
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockCreated);

    // Assert: DB Interaction
    expect(db.myModel.create).toHaveBeenCalledWith({
      data: input,
    });

    // Assert: Hook System Interaction
    expect(HookSystem.dispatch).toHaveBeenCalledWith('my-feature.created', {
      item: mockCreated,
    });
  });

  it('should handle database errors via ServiceResponse', async () => {
    // Arrange
    (db.myModel.create as any).mockRejectedValue(new Error('DB Error'));

    // Act
    const result = await MyService.create({ name: 'Fail' });

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('DB Error');
  });

  it('should apply data filters via HookSystem.filter', async () => {
    // Arrange
    const input = { name: 'Original' };
    const filteredData = { name: 'Modified By Hook' };
    (HookSystem.filter as any).mockResolvedValue(filteredData);
    (db.myModel.create as any).mockResolvedValue({ id: '2', ...filteredData });

    // Act
    await MyService.create(input);

    // Assert
    expect(HookSystem.filter).toHaveBeenCalledWith('my-feature.before-create', input);
    expect(db.myModel.create).toHaveBeenCalledWith({
      data: filteredData,
    });
  });
});
