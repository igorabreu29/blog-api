import { config } from 'dotenv'

import { execSync } from 'node:child_process'
import { beforeAll, afterAll } from 'vitest'

import postgres from 'postgres'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

const sql = postgres(process.env.DATABASE_URL as string)

beforeAll(() => {
	execSync('pnpm setup:test')
})

afterAll(async () => {
	await sql`TRUNCATE TABLE users, posts, likes, followers, comments, auth_links CASCADE;`
	await sql.end()
})
