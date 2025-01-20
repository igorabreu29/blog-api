import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { dayjs } from '@/lib/dayjs.ts'
import type { PostDetails } from './types/post.ts'

export async function getPost(app: FastifyTypedInstance) {
	app.get(
		'/posts/:id',
		{
			onRequest: [verifyJWT],
			schema: {
				tags: ['posts'],
				description: 'Get post',
				params: z.object({
					id: z.string().uuid(),
				}),
				response: {
					200: z.object({
						post: z.object({
							id: z.string(),
							title: z.string(),
							description: z.string(),
							image: z.string(),
							createdAt: z.string(),
							username: z.string(),
							likes: z.number(),
							comments: z.array(
								z.object({
									id: z.string(),
									text: z.string(),
									username: z.string(),
								})
							),
						}),
					}),
				},
			},
		},
		async (req, res) => {
			const { id } = req.params

			const result = (await sql`
        WITH comments_users AS (
          SELECT comments.id, post_id, comment, users.name FROM comments
          JOIN users
          ON users.id = comments.user_id
          WHERE post_id = ${id}
        )

        SELECT 
          posts.id,
          title,
          description,
          image,
          posts.created_at,
          users.name,
          (
            SELECT COUNT(*) FROM likes
            WHERE post_id = posts.id
          ) as likes,
          JSON_AGG(
            JSON_BUILD_OBJECT (
              'id', comments_users.id, 
              'comment', comments_users.comment, 
              'name',comments_users.name
              )
          ) as comments
        FROM posts
        JOIN users
        ON users.id = posts.user_id
        JOIN comments_users 
        ON comments_users.post_id = posts.id
        WHERE posts.id = ${id}
        GROUP BY posts.id, users.name
      `) as PostDetails[]

			const post = result[0]

			const postMapper = {
				id: post.id,
				title: post.title,
				description: post.description,
				image: post.image,
				createdAt: dayjs(post.created_at).format('DD/MM/YYYY'),
				username: post.name,
				likes: Number(post.likes),
				comments: post.comments.map(({ id, comment, name }) => ({
					id,
					text: comment,
					username: name,
				})),
			}

			return res.send({ post: postMapper })
		}
	)
}
