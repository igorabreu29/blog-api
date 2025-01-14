import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { createId } from '@/utils/create-id.ts'
import type { User } from './types/user.ts'

export async function updateUserProfile(app: FastifyTypedInstance) {
	app.patch(
		'/users',
		{
			onRequest: [verifyJWT],
			schema: {
				tags: ['users'],
				description: 'Update user profile',
				body: z.object({
					name: z
						.string()
						.optional()
						.transform(name => {
							if (name) {
								const validation = z
									.string()
									.min(3, 'Name cannot be less than 3 characters.')
									.max(40, 'Name cannot be bigger than 40 characters')

								return validation.parse(name)
							}

							return name
						}),
					email: z
						.string()
						.optional()
						.transform(email => {
							if (email) {
								const validation = z.string().email()
								return validation.parse(email)
							}

							return email
						}),
				}),
				response: {
					204: z.void(),
					400: z.object({
						status: z.literal(400),
						message: z.string(),
					}),
				},
			},
		},
		async (req, res) => {
			const { name, email } = req.body
			const { sub } = req.user

			const getResult = await sql`
        SELECT id, name, email FROM users WHERE id = ${sub}
      `

			const user = getResult[0] as User | undefined
			if (!user)
				return res.status(400).send({
					status: 400,
					message: 'User not found.',
				})

			const userName = name ?? user.name
			const userEmail = email ?? user.email

			await sql`
        UPDATE users SET name = ${userName}, email = ${userEmail} WHERE id = ${user.id};
      `

			return res.status(204).send()
		}
	)
}
