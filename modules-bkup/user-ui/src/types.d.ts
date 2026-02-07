/// <reference types="astro/client" />
import type { User } from '@auth/core/types';

interface AppUser extends User {
  type?: 'user';
  username?: string;
  role?: string;
  status?: string;
}

declare global {
  namespace App {
    interface ActorMap {
      user: AppUser;
    }
  }
}

export {};
