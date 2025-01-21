import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makePost } from 'test/factories/make-post.ts'

describe('Add Comment to Post', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('[POST /comments] should add comment to post', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const post = await makePost({ user_id: user.id })

		const response = await request(app.server)
			.post('/comments')
			.send({
				postId: post.id,
				comment: 'Comment',
			})
			.set('Cookie', cookie)
			.expect(201)

		const { id } = response.body

		expect(id).toBeDefined()
	})
})
