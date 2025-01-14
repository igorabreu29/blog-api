import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { sql } from '@/lib/postgres.ts'
import type { User } from './types/user.ts'

export async function getUserProfile(app: FastifyTypedInstance) {
	app.get(
		'/session/me',
		{
			onRequest: [verifyJWT],
			schema: {
				tags: ['users'],
				description: 'Get user profile',
				response: {
					200: z.object({
						user: z.object({
							id: z.string(),
							name: z.string(),
							email: z.string(),
							role: z.string(),
						}),
					}),
					400: z.object({
						status: z.literal(400),
						message: z.string(),
					}),
				},
			},
		},
		async (req, res) => {
			const { sub } = req.user

			const result = await sql`
				SELECT id, name, email, role FROM users WHERE id = ${sub}
			`

			const user = result[0] as User

			if (!user) {
				return res.status(400).send({ message: 'User not found.', status: 400 })
			}

			return res.send({
				user: {
					...user,
					role: user.role.toLowerCase(),
				},
			})
		}
	)
}
