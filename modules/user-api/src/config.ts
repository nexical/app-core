import { z } from 'astro:schema';
import { createConfig } from '@/lib/core/config';
import { UserMode } from './sdk/types';

const userSchema = z.object({
    PUBLIC_USER_MODE: z.nativeEnum(UserMode).default(UserMode.PUBLIC),
    ROOT_USER_EMAIL: z.string().email().optional(),
    ROOT_USER_PASSWORD: z.string().min(8).optional(),
    ROOT_USER_NAME: z.string().min(1).default('admin'),
});

const config = createConfig(userSchema);

export const userConfig = {
    userMode: config.PUBLIC_USER_MODE ?? UserMode.PUBLIC,
    rootUser: {
        email: config.ROOT_USER_EMAIL,
        password: config.ROOT_USER_PASSWORD,
        name: config.ROOT_USER_NAME ?? 'admin',
    }
};

export const isSingleMode = () => userConfig.userMode === UserMode.SINGLE;
export const isPublicMode = () => userConfig.userMode === UserMode.PUBLIC;
export const isAdminMode = () => userConfig.userMode === UserMode.ADMIN;
