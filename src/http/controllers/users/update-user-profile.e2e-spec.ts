import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { sql } from '@/lib/postgres.ts'
import type { User } from './types/user.ts'

describe('Update User', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('PATCH /users', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		await request(app.server)
			.patch('/users')
			.send({
				name: 'John Doe',
			})
			.set('Cookie', cookie)

		const result = await sql`SELECT * FROM users WHERE id = ${user.id};`
		const userOnDatabase = result[0] as User | undefined

		expect(userOnDatabase).toMatchObject({
			name: 'John Doe',
		})
	})
})
