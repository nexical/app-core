import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as logListGET } from '../../../../../src/pages/api/job-log/index';
import { GET as logGetGET } from '../../../../../src/pages/api/job-log/[id]';
import { GET as dlListGET } from '../../../../../src/pages/api/dead-letter-job/index';
import { GET as dlGetGET } from '../../../../../src/pages/api/dead-letter-job/[id]';
import { JobLogService } from '../../../../../src/services/job-log-service';
import { DeadLetterJobService } from '../../../../../src/services/dead-letter-job-service';
import { ApiGuard } from '@/lib/api/api-guard';
import { createMockAstroContext } from '@tests/unit/helpers';
import type { ServiceResponse } from '@/types/service';
import type { JobLog, DeadLetterJob } from '@prisma/client';

vi.mock('../../../../../src/services/job-log-service');
vi.mock('../../../../../src/services/dead-letter-job-service');
vi.mock('@/lib/api/api-guard');

describe('Log and Dead Letter Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ApiGuard.protect).mockResolvedValue(undefined as void);
  });

  describe('Job Logs', () => {
    it('should list logs', async () => {
      const mockContext = createMockAstroContext({
        locals: { actor: { id: 'u1' } },
      });
      vi.mocked(JobLogService.list).mockResolvedValue({
        success: true,
        data: [],
      } as unknown as ServiceResponse<JobLog[]>);
      await logListGET(mockContext);
      expect(JobLogService.list).toHaveBeenCalled();
    });

    it('should get a log', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'l1' },
        locals: { actor: { id: 'u1' } },
      });
      vi.mocked(JobLogService.get).mockResolvedValue({
        success: true,
        data: {},
      } as unknown as ServiceResponse<JobLog | null>);
      await logGetGET(mockContext);
      expect(JobLogService.get).toHaveBeenCalledWith('l1', expect.any(Object), { id: 'u1' });
    });
  });

  describe('Dead Letter Jobs', () => {
    it('should list dead letter jobs', async () => {
      const mockContext = createMockAstroContext({
        locals: { actor: { id: 'u1' } },
      });
      vi.mocked(DeadLetterJobService.list).mockResolvedValue({
        success: true,
        data: [],
      } as unknown as ServiceResponse<DeadLetterJob[]>);
      await dlListGET(mockContext);
      expect(DeadLetterJobService.list).toHaveBeenCalled();
    });

    it('should get a dead letter job', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'd1' },
        locals: { actor: { id: 'u1' } },
      });
      vi.mocked(DeadLetterJobService.get).mockResolvedValue({
        success: true,
        data: {},
      } as unknown as ServiceResponse<DeadLetterJob | null>);
      await dlGetGET(mockContext);
      expect(DeadLetterJobService.get).toHaveBeenCalledWith('d1', expect.any(Object), { id: 'u1' });
    });
  });
});
