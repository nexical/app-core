import { describe, it, expect } from 'vitest';
import { jobProcessors } from '../../src/registry';

describe('Agent Core Integration', () => {
  it('should load the registry correctly', () => {
    expect(jobProcessors).toBeDefined();
    // We expect at least the project.sync worker we know exists
    expect(Object.keys(jobProcessors)).toContain('project.sync');
  });

  it('should have a clean environment for testing', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
