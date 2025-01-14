import { env } from '@/env/index.ts'
import postgres from 'postgres'

export const sql = postgres(env.DATABASE_URL)
