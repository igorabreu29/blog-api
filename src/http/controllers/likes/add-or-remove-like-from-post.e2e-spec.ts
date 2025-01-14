import { app } from '@/app.ts'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makePost } from 'test/factories/make-post.ts'
import { sql } from '@/lib/postgres.ts'
import { makeLike } from 'test/factories/make-like.ts'

describe('Add or remove like from post', () => {
	beforeEach(async () => {
		await sql`DELETE FROM users;`
		await sql`DELETE FROM posts;`
		await sql`DELETE FROM likes;`

		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('POST /posts/:postId/likes', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const post = await makePost({ user_id: user.id })

		const response = await request(app.server)
			.post(`/posts/${post.id}/likes`)
			.set('Cookie', cookie)
			.expect(201)

		const { id } = response.body

		expect(id).toBeDefined()
	})

	it('POST /posts/postId/likes', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const post = await makePost({ user_id: user.id })
		await makeLike({ post_id: post.id, user_id: user.id })

		const response = await request(app.server)
			.post(`/posts/${post.id}/likes`)
			.set('Cookie', cookie)
			.expect(204)

		const likesOnDatabase = await sql`
      SELECT * FROM likes
    `

		expect(likesOnDatabase).toHaveLength(0)
	})
})
