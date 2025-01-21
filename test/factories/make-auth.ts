import request from 'supertest'
import { makeUser } from './make-user.ts'
import { app } from '@/app.ts'
import type { User } from '@/http/controllers/users/types/user.ts'

export async function makeAuth(override: Partial<User> = {}) {
	const user = await makeUser({ name: 'John Doe', ...override })
	const response = await request(app.server).get(
		`/authenticate?email=${user.email}`
	)

	const cookie = response.get('Set-Cookie')

	return {
		cookie,
		user,
	}
}
