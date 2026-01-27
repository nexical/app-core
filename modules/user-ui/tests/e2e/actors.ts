import { Factory } from '@tests/integration/lib/factory';
import { hashPassword } from '@modules/user-api/tests/integration/factory';
import type { Actor } from '@tests/e2e/lib/actor';

export const actors = {
    user: async (actor: Actor, params: any = {}) => {
        const password = params.password || 'Password123!';

        // 1. Get or Create User via Factory (Direct DB Access)
        let user;
        if (params.email) {
            user = await Factory.prisma.user.findUnique({ where: { email: params.email } });
        }

        if (!user) {
            user = await Factory.create('user', {
                role: params.role || 'EMPLOYEE',
                status: params.status || 'ACTIVE',
                password: hashPassword(password), // Need to ensure hashPassword is safe to use here
                ...params
            });
        }

        // 2. Authenticate via UI
        await actor.page.goto('/login');
        await actor.page.fill('[data-testid=login-identifier]', user.email);
        await actor.page.fill('[data-testid=login-password]', password);
        await actor.page.click('[data-testid=login-submit]');

        // Wait for redirect to home
        await actor.page.waitForURL(url => url.pathname === '/' || url.pathname === '/dashboard');

        return user;
    }
};
