import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeUser } from 'test/factories/make-user.ts'
import { makeAuthLink } from 'test/factories/make-auth-link.ts'
import { faker, ur } from '@faker-js/faker'
import { sql } from '@/lib/postgres.ts'

describe('Authenticate With Email', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('GET /links/authenticate', async () => {
		const user = await makeUser()
		const authLink = await makeAuthLink({ user_id: user.id })
		const redirectUrl = faker.internet.url()

		const response = await request(app.server).get(
			`/links/authenticate?code=${authLink.code}&redirectUrl=${redirectUrl}`
		)

		expect(response.headers).toMatchObject({
			'set-cookie': [expect.stringContaining('auth')],
		})

		const authLinks = await sql`
			SELECT * FROM auth_links
		`

		expect(authLinks).toHaveLength(0)
	})
})
