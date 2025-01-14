import { sql } from '@/lib/postgres.ts'
import { z } from 'zod'
import type { User } from './types/user.ts'
import type { FastifyTypedInstance } from '@/types.ts'

export async function authenticateWithEmail(app: FastifyTypedInstance) {
	app.get(
		'/authenticate',
		{
			schema: {
				tags: ['users'],
				description: 'Authenticate user with email',
				querystring: z.object({
					email: z.string().email(),
				}),
				response: {
					301: z.void(),
					400: z.object({
						status: z.literal(400),
						message: z.string(),
					}),
				},
			},
		},
		async (req, res) => {
			const { email } = req.query

			const getResult = await sql`
			  SELECT id, role FROM users WHERE email = ${email}
			`

			const userWithEmail = getResult[0] as User | undefined
			if (!userWithEmail)
				return res.status(400).send({
					status: 400,
					message: 'User not found.',
				})

			const token = await res.jwtSign(
				{
					role: userWithEmail.role.toLowerCase(),
				},
				{
					sub: userWithEmail.id,
				}
			)

			const secondsInDay = 60 * 60 * 24

			return res
				.setCookie('auth', token, {
					path: '/',
					secure: true,
					httpOnly: true,
					sameSite: true,
					maxAge: secondsInDay, // 1 day
				})
				.status(301)
				.send()
		}
	)
}
