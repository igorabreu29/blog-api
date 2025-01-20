import { sql } from '@/lib/postgres.ts'
import { createId } from '@/utils/create-id.ts'
import { makeUser } from './make-user.ts'
import { makePost } from './make-post.ts'
import type { Comment } from '@/http/controllers/comments/types/comment.ts'
import { faker } from '@faker-js/faker'

export async function makeComment(override: Partial<Comment> = {}) {
	const user = override.user_id ? { id: override.user_id } : await makeUser()
	const post = override.post_id
		? { id: override.post_id }
		: await makePost({ user_id: user.id })

	const comment = {
		id: createId(),
		user_id: user.id,
		post_id: post.id,
		comment: faker.lorem.text(),
		...override,
	}

	await sql`
    INSERT INTO comments (id, user_id, post_id, comment)
    VALUES (${comment.id}, ${comment.user_id}, ${comment.post_id}, ${comment.comment})
  `

	return comment
}
