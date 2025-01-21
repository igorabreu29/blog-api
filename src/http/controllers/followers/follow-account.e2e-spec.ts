import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { makeAuth } from 'test/factories/make-auth.ts'
import { makeUser } from 'test/factories/make-user.ts'
import { sql } from '@/lib/postgres.ts'
import { createId } from '@/utils/create-id.ts'
import { makeFollow } from 'test/factories/make-follow.ts'

describe('Follow Account', () => {
	beforeAll(async () => {
		await sql`
			DELETE FROM users;
		`
		await sql`
			DELETE FROM followers;
		`

		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('[POST /followers] should receive error if user to follow does not exist', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const followeeId = createId()

		const response = await request(app.server)
			.post('/followers')
			.send({
				followeeId,
			})
			.set('Cookie', cookie)

		const { message } = response.body

		expect(response.statusCode).toBe(400)
		expect(message).toEqual('User not found.')
	})

	it('[POST /followers] should receive status 409 if user is trying follow himself', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const response = await request(app.server)
			.post('/followers')
			.send({
				followeeId: user.id,
			})
			.set('Cookie', cookie)

		expect(response.statusCode).toBe(409)

		const { message } = response.body
		expect(message).toEqual('It is not allowed! You cannot follow yourself.')
	})

	it('[POST /followers] should unfollow if it already following user', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const userToFollow = await makeUser()
		await makeFollow({ follower_id: user.id, followee_id: userToFollow.id })

		const response = await request(app.server)
			.post('/followers')
			.send({
				followeeId: userToFollow.id,
			})
			.set('Cookie', cookie)

		expect(response.statusCode).toBe(204)

		const followersOnDatabase = await sql`
      SELECT * FROM followers;
    `

		expect(followersOnDatabase).toHaveLength(0)
	})

	it('[POST /followers] should follow acount', async () => {
		const { cookie, user } = await makeAuth()
		if (!cookie) return

		const userToFollow = await makeUser()

		const response = await request(app.server)
			.post('/followers')
			.send({
				followeeId: userToFollow.id,
			})
			.set('Cookie', cookie)

		expect(response.statusCode).toBe(201)

		const result = await sql`
      SELECT * FROM followers
      WHERE follower_id = ${user.id} AND followee_id = ${userToFollow.id}
    `
		const followersOnDatabase = result[0]

		expect(followersOnDatabase).toBeDefined()
	})
})
