import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'

describe('Create User', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('POST /users', async () => {
		const { cookie } = await makeAuth()
		if (!cookie) return

		const response = await request(app.server)
			.post('/users')
			.send({
				name: 'John Doe',
				email: 'john@example.com',
			})
			.set('Cookie', cookie)
			.expect(201)

		const { id } = response.body

		expect(id).toBeDefined()
	})
})
