import { app } from '@/app.ts'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { sql } from '@/lib/postgres.ts'
import { makePost } from 'test/factories/make-post.ts'

describe('Create Post', () => {
	beforeEach(async () => {
		await sql`DELETE FROM users;`
		await sql`DELETE FROM posts;`

		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('[POST /posts] should receive status 409 if post already exist with same title', async () => {
		const { cookie } = await makeAuth()
		if (!cookie) return

		const post = await makePost({ title: 'Title test' })

		const response = await request(app.server)
			.post('/posts')
			.send({
				title: post.title,
				description: 'Description test',
			})
			.set('Cookie', cookie)

		expect(response.statusCode).toBe(409)

		const { message } = response.body

		expect(message).toEqual('Post already exist.')
	})

	it('[POST /posts] should create post', async () => {
		const { cookie } = await makeAuth()
		if (!cookie) return

		const response = await request(app.server)
			.post('/posts')
			.send({
				title: 'Title test',
				description: 'Description test',
			})
			.set('Cookie', cookie)

		expect(response.statusCode).toBe(201)

		const { id } = response.body

		expect(id).toBeDefined()
	})
})
