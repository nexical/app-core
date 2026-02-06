import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GetAgentMetricsAction } from '../../../src/actions/get-agent-metrics';
import { GetJobMetricsAction } from '../../../src/actions/get-job-metrics';
import { HeartbeatAgentAction } from '../../../src/actions/heartbeat-agent';
import { CheckStaleAgentsOrchestratorAction } from '../../../src/actions/check-stale-agents-orchestrator';
import { createMockAstroContext } from '@tests/unit/helpers';
import { AgentService } from '../../../src/services/agent-service';
import { JobMetricsService } from '../../../src/services/job-metrics-service';
import { OrchestrationService } from '../../../src/services/orchestration-service';

vi.mock('../../../src/services/agent-service');
vi.mock('../../../src/services/job-metrics-service');
vi.mock('../../../src/services/orchestration-service');

describe('Metrics and Health Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GetAgentMetricsAction', () => {
    it('should return success (placeholder)', async () => {
      vi.mocked(JobMetricsService.getAgentMetrics).mockResolvedValue({
        total: 0,
        online: 0,
        offline: 0,
        busy: 0,
        jobsProcessedLast24h: 0,
      });
      const result = await GetAgentMetricsAction.run(undefined, createMockAstroContext());
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('GetJobMetricsAction', () => {
    it('should return success (placeholder)', async () => {
      vi.mocked(JobMetricsService.getJobMetrics).mockResolvedValue({
        total: 0,
        pending: 0,
        running: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
        retryRate: 0,
        successRate: 0,
      });
      const result = await GetJobMetricsAction.run(undefined, createMockAstroContext());
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('HeartbeatAgentAction', () => {
    it('should return success (placeholder)', async () => {
      vi.mocked(AgentService.update).mockResolvedValue({ success: true, data: undefined });
      const result = await HeartbeatAgentAction.run({ id: 'a1' }, createMockAstroContext());
      expect(result.success).toBe(true);
    });
  });

  describe('CheckStaleAgentsOrchestratorAction', () => {
    it('should return success (placeholder)', async () => {
      vi.mocked(OrchestrationService.checkStaleAgents).mockResolvedValue({
        success: true,
        data: { offlineAgents: 0, releasedJobs: 0 },
      });
      const result = await CheckStaleAgentsOrchestratorAction.run(
        undefined,
        createMockAstroContext(),
      );
      expect(result.success).toBe(true);
    });
  });
});
