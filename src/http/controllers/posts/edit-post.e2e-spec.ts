import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makePost } from 'test/factories/make-post.ts'
import { sql } from '@/lib/postgres.ts'
import { createId } from '@/utils/create-id.ts'
import { makeUser } from 'test/factories/make-user.ts'

describe('Edit Post', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('[PATCH /posts/:id] should receive status 400 if post does not exist', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const id = createId()

		const response = await request(app.server)
			.patch(`/posts/${id}`)
			.send({
				title: 'Edited',
			})
			.set('Cookie', cookie)

		expect(response.statusCode).toBe(400)

		const { message } = response.body

		expect(message).toEqual('Post not found.')
	})

	it('[PATCH /posts/:id] should receive status 409 if user not allowed to edit post', async () => {
		const { cookie } = await makeAuth()
		if (!cookie) return

		const user = await makeUser({ role: 'STUDENT' })

		const post = await makePost({ user_id: user.id })

		const response = await request(app.server)
			.patch(`/posts/${post.id}`)
			.send({})
			.set('Cookie', cookie)

		expect(response.statusCode).toBe(409)

		const { message } = response.body

		expect(message).toEqual('Not allowed!')
	})

	it('[PATCH /posts/:id] should edit post', async () => {
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
