import type { User } from './sdk/types.js';
declare global {
  namespace App {
    interface ActorMap {
      user: User & { type: 'user' };
    }
  }
}
