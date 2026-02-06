// GENERATED CODE - DO NOT MODIFY BY HAND
// GENERATED CODE - DO NOT MODIFY BY HAND
export interface CreateJobDTO {
  type: string;
  payload: unknown;
  actorId?: string;
  actorType?: string;
  userId?: string;
}

export interface PollJobsDTO {
  agentId: string;
  capabilities: string[];
}

export interface UpdateProgressDTO {
  progress: number;
  id: string;
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

export interface RegisterAgentDTO {
  id?: string;
  hostname: string;
  capabilities: string[];
}

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

export type { Job, JobLog, Agent, DeadLetterJob } from '@prisma/client';

export interface User {
  id: string;
}

export interface PersonalAccessToken {
  hashedKey: string;
  userId: string;
  prefix: string;
}
