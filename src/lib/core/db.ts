import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'; // Ensure env vars are loaded

const globalForPrisma = globalThis as unknown as { prisma_db_v1: PrismaClient }

const prismaClientSingleton = () => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma_db_v1 || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_db_v1 = db
