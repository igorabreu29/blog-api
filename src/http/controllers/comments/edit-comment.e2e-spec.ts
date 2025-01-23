import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makeComment } from 'test/factories/make-comment.ts'
import { sql } from '@/lib/postgres.ts'
import { createId } from '@/utils/create-id.ts'
import { makeUser } from 'test/factories/make-user.ts'

describe('Edit Comment', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('[PATCH /comments/:id] should receive status 400 if comment does not exist', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const id = createId()

		const response = await request(app.server)
			.patch(`/comments/${id}`)
			.send({
				comment: 'Edited',
			})
			.set('Cookie', cookie)

		expect(response.statusCode).toBe(400)

		const { message } = response.body

		expect(message).toEqual('Comment not found.')
	})

	it('[PATCH /comments/:id] should receive status 409 if user not allowed to delete comment', async () => {
		const { cookie } = await makeAuth()
		if (!cookie) return

		const user = await makeUser()

		const comment = await makeComment({ user_id: user.id })

		const response = await request(app.server)
			.patch(`/comments/${comment.id}`)
			.send({
				comment: 'Edited',
			})
			.set('Cookie', cookie)

		expect(response.statusCode).toBe(409)

		const { message } = response.body

		expect(message).toEqual('Not allowed!')
	})

	it('[PATCH /comments/:id] should edit comment', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const comment = await makeComment({ user_id: user.id })

		await request(app.server)
			.patch(`/comments/${comment.id}`)
			.send({
				comment: 'Edited',
			})
			.set('Cookie', cookie)
			.expect(204)

		const result = await sql`
      SELECT * FROM comments WHERE id = ${comment.id}
    `
		const commentOnDatabase = result[0]

		expect(commentOnDatabase).toMatchObject({
			comment: 'Edited',
		})
	})
})
