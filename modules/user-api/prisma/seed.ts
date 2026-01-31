import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

export async function seed(prisma: PrismaClient) {
  console.info('--- Seeding module: user ---');
  const rootUserName = process.env.ROOT_USER_NAME;
  const rootUserEmail = process.env.ROOT_USER_EMAIL;
  const rootUserPassword = process.env.ROOT_USER_DEFAULT_PASSWORD;

  if (!rootUserEmail || !rootUserPassword) {
    console.warn(
      'ROOT_USER_NAME, ROOT_USER_EMAIL, and ROOT_USER_DEFAULT_PASSWORD not set in environment. Skipping root user seeding.',
    );
    return;
  }

  console.info(`Seeding root user: ${rootUserName}`);

  const existingUser = await prisma.user.findUnique({
    where: { username: rootUserName },
  });

  if (existingUser) {
    console.info('Root user already exists. Skipping creation.');
  } else {
    const hashedPassword = await bcrypt.hash(rootUserPassword, 10);

    await prisma.user.create({
      data: {
        username: rootUserName,
        email: rootUserEmail,
        name: 'Root Administrator',
        password: hashedPassword,
        emailVerified: new Date(),
        role: 'ADMIN', // Explicitly set site role
      },
    });
    console.info('Root user created successfully.');
  }
}
