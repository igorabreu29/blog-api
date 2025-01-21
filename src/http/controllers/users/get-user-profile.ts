import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { sql } from '@/lib/postgres.ts'
import type { User, UserAccount } from './types/user.ts'

export async function getUserProfile(app: FastifyTypedInstance) {
	app.get(
		'/session/me',
		{
			onRequest: [verifyJWT],
			schema: {
				tags: ['users'],
				description: 'Get user profile',
				response: {
					200: z.object({
						account: z.object({
							id: z.string(),
							name: z.string(),
							email: z.string(),
							followers: z.number(),
							following: z.number(),
							posts: z.array(
								z.object({
									id: z.string().nullable(),
									title: z.string().nullable(),
									image: z.string().nullable(),
								})
							),
						}),
					}),
					400: z.object({
						status: z.literal(400),
						message: z.string(),
					}),
				},
			},
		},
		async (req, res) => {
			const { sub } = req.user

			const result = (await sql`
				SELECT 
					users.id,
					name, 
					email, 
					(
						SELECT COUNT(follower_id)
						FROM followers 
						WHERE follower_id = ${sub}
					) as followers,
					(
						SELECT COUNT(followee_id)
						FROM followers 
						WHERE followee_id = ${sub}
					) as following,
					JSON_AGG(
						JSON_BUILD_OBJECT(
							'id', posts.id,
							'title', posts.title,
							'image', posts.image
						)
					) as posts
				FROM users
				LEFT JOIN posts
				ON posts.user_id = users.id
				WHERE users.id = ${sub}
				GROUP BY users.id
			`) as UserAccount[]

			const user = result[0]

			if (!user) {
				return res.status(400).send({ message: 'User not found.', status: 400 })
			}

			const account = {
				id: user.id,
				name: user.name,
				email: user.email,
				followers: Number(user.followers),
				following: Number(user.following),
				posts: user.posts,
			}

			return res.send({
				account,
			})
		}
	)
}
