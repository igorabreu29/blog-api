import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'

describe('Get User Profile', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('GET /session/me', async () => {
		const { cookie, user: userCreated } = await makeAuth()
		if (!cookie) return

		const response = await request(app.server)
			.get('/session/me')
			.set('Cookie', cookie)

		expect(response.status).toBe(200)

		const { user } = response.body

		expect(user).toMatchObject({
			id: userCreated.id,
		})
	})
})
