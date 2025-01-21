import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'
import type { User } from '../users/types/user.ts'
import type { Followers } from './types/followers.ts'
import { createId } from '@/utils/create-id.ts'

export async function followAccount(app: FastifyTypedInstance) {
	app.post(
		'/followers',
		{
			onRequest: [verifyJWT],
			schema: {
				tags: ['follows'],
				description: 'Follow an user',
				body: z.object({
					followeeId: z.string().uuid(),
				}),
				response: {
					201: z.void(),
					204: z.void(),
					400: z.object({
						status: z.literal(400),
						message: z.string(),
					}),
				},
			},
		},
		async (req, res) => {
			const { sub } = req.user
			const { followeeId } = req.body

			const getUserResult = await sql`
        SELECT id FROM users
        WHERE id = ${followeeId}
      `
			const followeeUser = getUserResult[0] as Pick<User, 'id'>
			if (!followeeUser) {
				return res.status(400).send({ message: 'User not found.', status: 400 })
			}

			const alreadyFollowingResult = await sql`
        SELECT * FROM followers
        WHERE follower_id = ${sub} AND followee_id = ${followeeUser.id}
      `
			const alreadyFollowing = alreadyFollowingResult[0] as Followers
			if (alreadyFollowing) {
				await sql`
          DELETE FROM followers
          WHERE id = ${alreadyFollowing.id}
        `

				return res.status(204).send()
			}

			const id = createId()

			await sql`
        INSERT INTO followers
        VALUES (${id}, ${sub}, ${followeeUser.id})
      `

			return res.status(201).send()
		}
	)
}
