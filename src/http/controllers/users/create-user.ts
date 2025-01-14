import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { verifyUserRole } from '@/http/middlewares/verify-user-role.ts'
import { createId } from '@/utils/create-id.ts'

export async function createUser(app: FastifyTypedInstance) {
	app.post(
		'/users',
		{
			onRequest: [verifyJWT, verifyUserRole('admin')],
			schema: {
				tags: ['users'],
				description: 'Create a new user',
				body: z.object({
					name: z
						.string()
						.min(3, 'Name cannot be less than 3 characters.')
						.max(40, 'Name cannot be bigger than 40 characters'),
					email: z.string().email(),
				}),
				response: {
					201: z.object({
						id: z.string(),
					}),

					409: z.object({
						status: z.literal(409),
						message: z.string(),
					}),
				},
			},
		},
		async (req, res) => {
			const { name, email } = req.body

			const getResult = await sql`
				SELECT * FROM users WHERE email = ${email}
			`

			const userExist = getResult[0]
			if (userExist)
				return res.status(409).send({
					status: 409,
					message: 'User already exist.',
				})

			const id = createId()

			const insertResult = await sql`
				INSERT INTO users (id, name, email) 
				VALUES (${id}, ${name}, ${email}) 
				RETURNING id
			`

			const user = insertResult[0]

			return res.status(201).send({ id: user.id })
		}
	)
}
