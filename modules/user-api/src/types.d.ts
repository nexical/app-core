import type { User } from './sdk/types';
declare global {
  namespace App {
    interface ActorMap {
      user: User & { type: 'user' };
    }
  }
}
