import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makeComment } from 'test/factories/make-comment.ts'
import { sql } from '@/lib/postgres.ts'

describe('Delete Comment', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('DELETE /comments', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const comment = await makeComment({ user_id: user.id })

		await request(app.server)
			.delete(`/comments/${comment.id}`)
			.set('Cookie', cookie)
			.expect(204)

		const result = await sql`
      SELECT * FROM comments
    `
		const commentsOnDatabase = result

		expect(commentsOnDatabase).toHaveLength(0)
	})
})
