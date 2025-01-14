import request from 'supertest'
import { makeUser } from './make-user.ts'
import { app } from '@/app.ts'

export async function makeAuth() {
	const user = await makeUser()
	const response = await request(app.server).get(`/authenticate?email=${user.email}`)

	const cookie = response.get('Set-Cookie')

	return {
		cookie,
		user,
	}
}
