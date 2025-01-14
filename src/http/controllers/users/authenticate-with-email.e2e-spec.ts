import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeUser } from 'test/factories/make-user.ts'

describe('Authenticate With Email', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('GET /authenticate', async () => {
		const { email } = await makeUser()

		const response = await request(app.server).get(
			`/authenticate?email=${email}`
		)

		expect(response.status).toBe(301)
		expect(response.headers).toMatchObject({
			'set-cookie': [expect.stringContaining('auth')],
		})
	})
})
