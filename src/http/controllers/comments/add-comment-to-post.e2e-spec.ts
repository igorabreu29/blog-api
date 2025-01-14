import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makePost } from 'test/factories/make-post.ts'
import { sql } from '@/lib/postgres.ts'

describe('Add Comment to Post', () => {
	beforeAll(async () => {
		await sql`DELETE FROM users;`
		await sql`DELETE FROM posts;`
		await sql`DELETE FROM comments;`

		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('POST /posts/:postId/comments', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const post = await makePost({ user_id: user.id })

		const response = await request(app.server)
			.post(`/posts/${post.id}/comments`)
			.set('Cookie', cookie)
			.expect(201)

		const { id } = response.body

		expect(id).toBeDefined()
	})
})
