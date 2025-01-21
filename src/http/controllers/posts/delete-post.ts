import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import type { Post } from './types/post.ts'

export async function deletePost(app: FastifyTypedInstance) {
	app.delete(
		'/posts/:id',
		{
			onRequest: [verifyJWT],
			schema: {
				tags: ['posts'],
				description: 'Delete a post',
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
			const { sub, role } = req.user
			const { id } = req.params

			const getPostResult = await sql`
        SELECT * FROM posts WHERE id = ${id};
      `

			const post = getPostResult[0] as Post | undefined
			if (!post)
				return res.status(400).send({
					status: 400,
					message: 'Post not found.',
				})

			if (role === 'student' && post.user_id !== sub) {
				return res.status(409).send({
					status: 409,
					message: 'Not allowed!',
				})
			}

			await sql`
        DELETE FROM posts 
        WHERE id = ${post.id}
      `

			return res.status(204).send()
		}
	)
}
