import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makePost } from 'test/factories/make-post.ts'
import { makeLike } from 'test/factories/make-like.ts'
import { makeComment } from 'test/factories/make-comment.ts'
import { makeUser } from 'test/factories/make-user.ts'

describe('Get Posts', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('GET /posts', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const user2 = await makeUser({ name: 'User 2' })

		const post = await makePost({ user_id: user.id })
		await makeLike({ user_id: user.id, post_id: post.id })
		const comment = await makeComment({
			post_id: post.id,
			user_id: user.id,
			comment: 'Comment 1',
		})
		const comment2 = await makeComment({
			post_id: post.id,
			user_id: user2.id,
			comment: 'Comment 2',
		})

		const response = await request(app.server)
			.get('/posts')
			.set('Cookie', cookie)
			.expect(200)

		const { posts } = response.body

		expect(posts).toHaveLength(1)
		expect(posts).toMatchObject([
			{
				id: post.id,
				username: user.name,
				comments: [
					{
						id: comment.id,
						username: user.name,
					},
					{
						id: comment2.id,
						username: user2.name,
					},
				],
			},
		])
	})
})
