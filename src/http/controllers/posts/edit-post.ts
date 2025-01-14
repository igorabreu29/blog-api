import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import type { Post } from './types/post.ts'

export async function editPost(app: FastifyTypedInstance) {
	app.patch(
		'/posts/:id',
		{
			onRequest: [verifyJWT],
			schema: {
				tags: ['posts'],
				description: 'Update a post',
				params: z.object({
					id: z.string().uuid(),
				}),
				body: z.object({
					title: z
						.string()
						.optional()
						.transform(title => {
							if (title) {
								const validation = z.string().min(1, 'Title cannot be empty!')
								return validation.parse(title)
							}

							return title
						}),
					description: z
						.string()
						.optional()
						.transform(description => {
							if (description) {
								const validation = z
									.string()
									.min(1, 'Description cannot be empty!')
								return validation.parse(description)
							}

							return description
						}),
					image: z.string().optional(),
				}),
				response: {
					204: z.void(),
					400: z.object({
						status: z.literal(400),
						message: z.string(),
					}),
					409: z.object({
						status: z.literal(409),
						message: z.string(),
					}),
				},
			},
		},
		async (req, res) => {
			const { id } = req.params
			const { title, description, image } = req.body
			const { sub } = req.user

			const getPostResult = await sql`
        SELECT * FROM posts WHERE id = ${id};
      `

			const post = getPostResult[0] as Post | undefined
			if (!post)
				return res.status(400).send({
					status: 400,
					message: 'Post not found.',
				})

			if (post.user_id !== sub) {
				return res.status(409).send({
					status: 409,
					message: 'Not allowed!',
				})
			}

			const titleToUpdate = title ?? post.title
			const descriptionToUpdate = description ?? post.description
			const imageToUpdate = image ?? post.image

			await sql`
        UPDATE posts 
        SET title = ${titleToUpdate}, 
        description = ${descriptionToUpdate},
        image = ${imageToUpdate}
        WHERE id = ${post.id}
      `

			return res.status(204).send()
		}
	)
}
