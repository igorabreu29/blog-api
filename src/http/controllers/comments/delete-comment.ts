import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { sql } from '@/lib/postgres.ts'
import type { Comment } from './types/comment.ts'

export async function deleteComment(app: FastifyTypedInstance) {
	app.delete(
		'/comments/:id',
		{
			onRequest: [verifyJWT],
			schema: {
				tags: ['comments'],
				description: 'Delete a comment',
				params: z.object({
					id: z.string().uuid(),
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
			const { sub, role } = req.user

			const getCommentResult = await sql`
        SELECT * FROM comments WHERE id = ${id};
      `

			const comment = getCommentResult[0] as Comment | undefined
			if (!comment)
				return res.status(400).send({
					status: 400,
					message: 'Comment not found.',
				})

			if (role === 'student' && comment.user_id !== sub) {
				return res.status(409).send({
					status: 409,
					message: 'Not allowed!',
				})
			}

			await sql`
        DELETE FROM comments 
        WHERE id = ${comment.id}
      `

			return res.status(204).send()
		}
	)
}
