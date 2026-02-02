// GENERATED CODE - DO NOT MODIFY BY HAND
export interface CreateJobDTO {
  type: string;
  payload: unknown;
  actorId?: string;
  actorType?: string;
  userId?: string;
  progress?: number;
}

export interface PollJobsDTO {
  capabilities: string[];
  agentId: string;
}

export type { Job, JobLog, Agent, DeadLetterJob } from '@prisma/client';

export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum AgentStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  BUSY = 'BUSY',
}

export interface UpdateProgressDTO {
  progress: number;
}

export interface JobMetrics {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  avgCompletionTimeMs?: number;
  retryRate: number;
  successRate: number;
}

export interface AgentMetrics {
  total: number;
  online: number;
  offline: number;
  busy: number;
  jobsProcessedLast24h: number;
}

export interface CompleteJobDTO {
  id: string;
  result?: unknown;
}

export interface FailJobDTO {
  id: string;
  error?: unknown;
}

export interface CancelJobDTO {
  id: string;
}

export interface HeartbeatDTO {
  id: string;
}
