import { execSync } from 'node:child_process'
import { sql } from './lib/postgres.ts'
import { createId } from './utils/create-id.ts'

async function seed() {
	await sql`DROP TABLE users CASCADE`
	await sql`DROP TABLE posts CASCADE`
	await sql`DROP TABLE comments CASCADE`
	await sql`DROP TABLE likes CASCADE`
	await sql`DROP TABLE followers CASCADE`

	execSync('pnpm run setup')

	const user = {
		id: createId(),
		name: 'Igor Abreu',
		email: 'abreusense@gmail.com',
		role: 'ADMIN',
	}

	await sql`
    INSERT INTO users (id, name, email, role)
    VALUES (${user.id}, ${user.name}, ${user.email}, ${user.role})
  `
}

await seed()
