import type { Post } from '@/http/controllers/posts/types/post.ts'
import { sql } from '@/lib/postgres.ts'
import { createId } from '@/utils/create-id.ts'
import { faker } from '@faker-js/faker'
import { makeUser } from './make-user.ts'

export async function makePost(override: Partial<Post> = {}) {
	const user = override.user_id ? { id: override.user_id } : await makeUser()

	const post = {
		id: createId(),
		user_id: user.id,
		title: faker.book.title(),
		description: faker.lorem.text(),
		image: faker.image.url(),
		...override,
	}

	await sql`
    INSERT INTO posts (id, user_id, title, description, image)
    VALUES (${post.id}, ${post.user_id}, ${post.title}, ${post.description}, ${post.image})
  `

	return post
}
