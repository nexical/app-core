import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as logListGET } from '../../../../../src/pages/api/job-log/index';
import { GET as logGetGET } from '../../../../../src/pages/api/job-log/[id]';
import { GET as dlListGET } from '../../../../../src/pages/api/dead-letter-job/index';
import { GET as dlGetGET } from '../../../../../src/pages/api/dead-letter-job/[id]';
import { JobLogService } from '../../../../../src/services/job-log-service';
import { DeadLetterJobService } from '../../../../../src/services/dead-letter-job-service';
import { ApiGuard } from '@/lib/api/api-guard';
import { createMockAstroContext } from '@tests/unit/helpers';

vi.mock('../../../../../src/services/job-log-service');
vi.mock('../../../../../src/services/dead-letter-job-service');
vi.mock('@/lib/api/api-guard');

describe('Log and Dead Letter Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ApiGuard.protect as any).mockResolvedValue(true);
  });

  describe('Job Logs', () => {
    it('should list logs', async () => {
      const mockContext = createMockAstroContext({
        locals: { actor: { id: 'u1' } },
      });
      (JobLogService.list as any).mockResolvedValue({ success: true, data: [] });
      await logListGET(mockContext);
      expect(JobLogService.list).toHaveBeenCalled();
    });

    it('should get a log', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'l1' },
        locals: { actor: { id: 'u1' } },
      });
      (JobLogService.get as any).mockResolvedValue({ success: true, data: {} });
      await logGetGET(mockContext);
      expect(JobLogService.get).toHaveBeenCalledWith('l1', expect.any(Object), { id: 'u1' });
    });
  });

  describe('Dead Letter Jobs', () => {
    it('should list dead letter jobs', async () => {
      const mockContext = createMockAstroContext({
        locals: { actor: { id: 'u1' } },
      });
      (DeadLetterJobService.list as any).mockResolvedValue({ success: true, data: [] });
      await dlListGET(mockContext);
      expect(DeadLetterJobService.list).toHaveBeenCalled();
    });

    it('should get a dead letter job', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'd1' },
        locals: { actor: { id: 'u1' } },
      });
      (DeadLetterJobService.get as any).mockResolvedValue({ success: true, data: {} });
      await dlGetGET(mockContext);
      expect(DeadLetterJobService.get).toHaveBeenCalledWith('d1', expect.any(Object), { id: 'u1' });
    });
  });
});
