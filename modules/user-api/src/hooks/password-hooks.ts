import { HookSystem } from '@/lib/modules/hooks';
import bcrypt from 'bcryptjs';
import type { CreateUserDTO, UpdateUserDTO } from '../sdk/types';

export class PasswordHooks {
  static init() {
    // Handle Password Hashing on Create
    HookSystem.filter('user.beforeCreate', async (data: CreateUserDTO) => {
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
      }
      return data;
    });

    // Handle Password Hashing on Update
    HookSystem.filter('user.beforeUpdate', async (data: UpdateUserDTO) => {
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
        (data as UpdateUserDTO & { passwordUpdatedAt?: Date }).passwordUpdatedAt = new Date();
      }
      return data;
    });
  }
}

export const init = () => PasswordHooks.init();
