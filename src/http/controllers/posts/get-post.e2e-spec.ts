import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makePost } from 'test/factories/make-post.ts'
import { makeLike } from 'test/factories/make-like.ts'
import { makeComment } from 'test/factories/make-comment.ts'
import { makeUser } from 'test/factories/make-user.ts'

describe('Get Post', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('GET /posts/:id', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const user2 = await makeUser({ name: 'User 2' })

		const postCreated = await makePost({ user_id: user.id })
		await makeLike({ user_id: user.id, post_id: postCreated.id })
		const comment = await makeComment({
			post_id: postCreated.id,
			user_id: user2.id,
			comment: 'Comment',
		})

		const response = await request(app.server)
			.get(`/posts/${postCreated.id}`)
			.set('Cookie', cookie)

		expect(response.statusCode).toBe(200)

		const { post } = response.body

		expect(post).toMatchObject({
			id: post.id,
			username: user.name,
			likes: 1,
			comments: {
				quantity: 1,
				commentaries: [
					{
						id: comment.id,
						username: user2.name,
					},
				]
			},
		})
	})
})
