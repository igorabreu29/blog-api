import { sql } from '@/lib/postgres.ts'
import { createId } from '@/utils/create-id.ts'
import { makeUser } from './make-user.ts'
import type { Like } from '@/http/controllers/likes/types/like.ts'
import { makePost } from './make-post.ts'

export async function makeLike(override: Partial<Like> = {}) {
	const user = override.user_id ? { id: override.user_id } : await makeUser()
	const post = override.post_id
		? { id: override.post_id }
		: await makePost({ user_id: user.id })

	const like = {
		id: createId(),
		user_id: user.id,
		post_id: post.id,
		...override,
	}

	await sql`
    INSERT INTO likes (id, user_id, post_id)
    VALUES (${like.id}, ${like.user_id}, ${like.post_id})
  `

	return like
}
