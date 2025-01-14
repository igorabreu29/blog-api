import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeUser } from 'test/factories/make-user.ts'

describe('Sign In', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('POST /sign-in', async () => {
		const { email } = await makeUser()

		const response = await request(app.server).post('/sign-in').send({
			email,
		})

		expect(response.status).toBe(201)
	})
})
