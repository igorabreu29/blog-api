import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makeComment } from 'test/factories/make-comment.ts'
import { sql } from '@/lib/postgres.ts'

describe('Edit Comment', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('PATCH /comments', async () => {
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
