import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { createId } from '@/utils/create-id.ts'

export async function getPosts(app: FastifyTypedInstance) {
	app.get(
		'/posts',
		{
			onRequest: [verifyJWT],
			schema: {
				tags: ['posts'],
				description: 'Create a new post',
				response: {
					// 200: z.object({
					// 	id: z.string(),
					// 	title: z.string(),
					// 	description: z.string(),
					// 	image: z.string(),
					// 	createdAt: z.string(),
					// 	username: z.string(),
					// 	likes: z.number(),
					// 	comments: z.array(
					// 		z.object({
					// 			id: z.string(),
					// 			comment: z.string(),
					// 			username: z.string(),
					// 		})
					// 	),
					// }),

					409: z.object({
						status: z.literal(409),
						message: z.string(),
					}),
				},
			},
		},
		async (req, res) => {
			const posts = await sql`
        SELECT 
          posts.id,
          title,
          description,
          image,
          posts.created_at,
          users.name,
          COUNT(likes),
          (
            SELECT comments.id FROM comments
            JOIN users
            ON users.id = comments.user_id
            WHERE comments.post_id = posts.id
            GROUP BY posts.id
          ) as comments
        FROM posts
        JOIN users
        ON users.id = posts.user_id
        JOIN likes
        ON likes.post_id = posts.id
      `

			return res.send(posts)
		}
	)
}
