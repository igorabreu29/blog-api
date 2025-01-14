import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import type { Comment } from './types/comment.ts'

export async function editComment(app: FastifyTypedInstance) {
	app.patch(
		'/comments/:id',
		{
			onRequest: [verifyJWT],
			schema: {
				tags: ['posts'],
				description: 'Edit Commentary',
				params: z.object({
					id: z.string().uuid(),
				}),
				body: z.object({
					comment: z
						.string()
						.optional()
						.transform(comment => {
							if (comment) {
								const validation = z
									.string()
									.min(1, 'Commentary cannot be empty!')
								return validation.parse(comment)
							}

							return comment
						}),
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
			const { comment } = req.body
			const { sub } = req.user

			const getCommentResult = await sql`
        SELECT * FROM comments WHERE id = ${id};
      `

			const commentary = getCommentResult[0] as Comment | undefined
			if (!commentary)
				return res.status(400).send({
					status: 400,
					message: 'Commentary not found.',
				})

			if (commentary.user_id !== sub) {
				return res.status(409).send({
					status: 409,
					message: 'Not allowed!',
				})
			}

			const commentToUpdate = comment ?? commentary.comment

			await sql`
        UPDATE comments 
        SET comment = ${commentToUpdate}, 
        WHERE id = ${commentary.id}
      `

			return res.status(204).send()
		}
	)
}
