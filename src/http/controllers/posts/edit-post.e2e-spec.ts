import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makePost } from 'test/factories/make-post.ts'
import { sql } from '@/lib/postgres.ts'

describe('Edit Post', () => {
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

		await request(app.server)
			.patch(`/posts/${post.id}`)
			.send({
				title: 'Edited',
			})
			.set('Cookie', cookie)
			.expect(204)

		const result = await sql`
      SELECT * FROM posts WHERE id = ${post.id}
    `
		const postOnDatabase = result[0]

		expect(postOnDatabase).toMatchObject({
			title: 'Edited',
		})
	})
})
