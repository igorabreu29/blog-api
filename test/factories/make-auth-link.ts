import { sql } from '@/lib/postgres.ts'
import { createId } from '@/utils/create-id.ts'
import { makeUser } from './make-user.ts'

interface AuthLink {
	id: string
	code: string
	user_id: string
}

export async function makeAuthLink(override: Partial<AuthLink> = {}) {
	const user = override.user_id ? { id: override.user_id } : await makeUser()

	const authLink = {
		id: createId(),
		code: createId(),
		user_id: user.id,
		...override,
	}

	await sql`
    INSERT INTO auth_links
    VALUES (${authLink.id}, ${authLink.code}, ${authLink.user_id})
  `

	return authLink
}
