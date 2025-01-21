import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { createId } from '@/utils/create-id.ts'

export async function addCommentToPost(app: FastifyTypedInstance) {
	app.post(
		'/comments',
		{
			onRequest: [verifyJWT],
			schema: {
				tags: ['comments'],
				description: 'Add commentary to post',
				body: z.object({
					postId: z.string().uuid(),
					comment: z.string().min(1, 'Commentary cannot be empty!'),
				}),
				response: {
					201: z.object({
						id: z.string(),
					}),
				},
			},
		},
		async (req, res) => {
			const { sub } = req.user
			const { postId, comment } = req.body

			const id = createId()
			const insertCommentResult = await sql`
				INSERT INTO comments (id, user_id, post_id, comment) 
				VALUES (${id}, ${sub}, ${postId}, ${comment}) 
				RETURNING id
			`

			const commentCreated = insertCommentResult[0]

			return res.status(201).send({ id: commentCreated.id })
		}
	)
}
