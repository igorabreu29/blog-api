import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { createId } from '@/utils/create-id.ts'

export async function createPost(app: FastifyTypedInstance) {
	app.post(
		'/posts',
		{
			onRequest: [verifyJWT],
			schema: {
				tags: ['posts'],
				description: 'Create a new post',
				body: z.object({
					title: z.string().min(1, 'Title cannot be empty!'),
					description: z.string().min(1, 'Description cannot be empty!'),
					image: z.string().optional(),
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
			const { title, description, image } = req.body
			const { sub } = req.user

			const getPostResult = await sql`
				SELECT * FROM posts WHERE title = ${title}
			`

			const postExist = getPostResult[0]
			if (postExist)
				return res.status(409).send({
					status: 409,
					message: 'Post already exist.',
				})

			const insertPostResult = await sql`
				INSERT INTO posts (id, user_id, title, description, image) 
				VALUES (${createId()}, ${sub}, ${title}, ${description}, ${image ?? null}) 
				RETURNING id
			`

			const post = insertPostResult[0]

			return res.status(201).send({ id: post.id })
		}
	)
}
