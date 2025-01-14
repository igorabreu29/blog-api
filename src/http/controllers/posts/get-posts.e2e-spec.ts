import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makePost } from 'test/factories/make-post.ts'
import { sql } from '@/lib/postgres.ts'
import { makeLike } from 'test/factories/make-like.ts'
import { makeComment } from 'test/factories/make-comment.ts'

describe('Get Posts', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('PATCH /posts', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const post = await makePost({ user_id: user.id })
		await makeLike({ user_id: user.id, post_id: post.id })
		await makeComment({ post_id: post.id, user_id: user.id })

		const response = await request(app.server)
			.get('/posts')
			.set('Cookie', cookie)
		console.log(response.body)
	})
})
