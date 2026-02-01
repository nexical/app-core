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
}

export interface CompleteJobDTO {
  result: unknown;
}

export interface FailJobDTO {
  error: unknown;
}

export interface RegisterAgentDTO {
  id?: string;
  hostname: string;
  capabilities: string[];
}

export const JobStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;
export const AgentStatus = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  BUSY: 'BUSY',
} as const;

export type { Job, JobLog, Agent } from '@prisma/client';

export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum AgentStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  BUSY = 'BUSY',
}
