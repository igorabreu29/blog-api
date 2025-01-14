import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'

describe('Create Post', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('POST /posts', async () => {
		const { cookie } = await makeAuth()
		if (!cookie) return

		const response = await request(app.server)
			.post('/posts')
			.send({
				title: 'Title test',
				description: 'Description test',
			})
			.set('Cookie', cookie)

		const { id } = response.body

		expect(id).toBeDefined()
	})
})
