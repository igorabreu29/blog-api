import { sql } from '@/lib/postgres.ts'
import { faker } from '@faker-js/faker'
import { v7 as uuidV7 } from 'uuid'

interface User {
	name: string
	email: string
	role: string
}

export async function makeUser(override: Partial<User> = {}) {
	const user = {
		id: uuidV7(),
		name: faker.person.firstName(),
		email: faker.internet.email(),
		role: 'ADMIN',
		...override,
	}

	await sql`
    INSERT INTO users (id, name, email, role)
    VALUES (${user.id}, ${user.name}, ${user.email}, ${user.role})
  `

	return user
}
