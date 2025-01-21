import { sql } from '@/lib/postgres.ts'
import { createId } from '@/utils/create-id.ts'
import { makeUser } from './make-user.ts'
import type { Followers } from '@/http/controllers/followers/types/followers.ts'

export async function makeFollow(override: Partial<Followers> = {}) {
	const follower = override.follower_id
		? { id: override.follower_id }
		: await makeUser({ name: 'User' })
	const followee = override.followee_id
		? { id: override.followee_id }
		: await makeUser({ name: 'User 2' })

	const follow = {
		id: createId(),
		follower_id: follower.id,
		followee_id: followee.id,
		...override,
	}

	await sql`
    INSERT INTO followers
    VALUES (${follow.id}, ${follow.follower_id}, ${follow.followee_id})
  `

	return follow
}
