import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { dayjs } from '@/lib/dayjs.ts'
import type { PostDetails } from './types/post.ts'

export async function getPosts(app: FastifyTypedInstance) {
	app.get(
		'/posts',
		{
			onRequest: [verifyJWT],
			schema: {
				tags: ['posts'],
				description: 'Get posts',
				response: {
					200: z.object({
						posts: z.array(
							z.object({
								id: z.string(),
								title: z.string(),
								description: z.string(),
								image: z.string(),
								createdAt: z.string(),
								username: z.string(),
								likes: z.number(),
								comments: z.array(
									z.object({
										id: z.string().nullable(),
										text: z.string().nullable(),
										username: z.string().nullable(),
									})
								),
							})
						),
					}),
				},
			},
		},
		async (req, res) => {
			const total = await sql`
				WITH comments_users AS (
					SELECT comments.id, post_id, comment, users.name FROM comments
					JOIN users
					ON users.id = comments.user_id
				)

				SELECT 
					posts.id,           
					title,
          description,
          image,
          posts.created_at,
					JSON_AGG(
						JSON_BUILD_OBJECT (
							'id', comments_users.id, 
							'comment', comments_users.comment, 
							'name',comments_users.name
							)
					) as comments
				FROM posts
				LEFT JOIN comments_users
				ON comments_users.post_id = posts.id
				GROUP BY posts.id
			`
			console.log(total[0].comments)

			const result = (await sql`
				WITH comments_users AS (
					SELECT comments.id, post_id, comment, users.name FROM comments
					JOIN users
					ON users.id = comments.user_id
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
        LEFT JOIN users
        ON users.id = posts.user_id
				LEFT JOIN comments_users 
				ON comments_users.post_id = posts.id
				GROUP BY posts.id, users.name
      `) as PostDetails[]

			const posts = result.map(result => ({
				id: result.id,
				title: result.title,
				description: result.description,
				image: result.image,
				createdAt: dayjs(result.created_at).format('DD/MM/YYYY'),
				username: result.name,
				likes: Number(result.likes),
				comments: result.comments.map(({ id, comment, name }) => ({
					id,
					text: comment,
					username: name,
				})),
			}))

			return res.send({ posts })
		}
	)
}
