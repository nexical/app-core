// GENERATED CODE - DO NOT MODIFY
import bcrypt from 'bcryptjs';
import { Factory } from '@tests/integration/lib/factory';

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export const factories = {
  job: (index: number) => {
    return {
      type: `type_${index}`,
      userId: `userId_${index}`,
      actorId: `actorId_${index}`,
      actorType: `actorType_${index}`,
      progress: index,
      lockedBy: `lockedBy_${index}`,
      lockedAt: new Date(),
      startedAt: new Date(),
      completedAt: new Date(),
    };
  },
  jobLog: (index: number) => {
    return {
      job: {
        create: Factory.getBuilder('job')(index),
      },
      level: `level_${index}`,
      message: `message_${index}`,
      timestamp: new Date(),
    };
  },
  agent: (index: number) => {
    return {
      hostname: `hostname_${index}`,
      capabilities: [`capabilities_${index}`],
      lastHeartbeat: new Date(),
    };
  },
};
