import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'
import type { Like } from './types/like.ts'
import { createId } from '@/utils/create-id.ts'

export function addOrRemoveLikeFromPost(app: FastifyTypedInstance) {
	app.post(
		'/posts/:postId/likes',
		{
			onRequest: [verifyJWT],
			schema: {
				description: 'Add like to post',
				tags: ['likes'],
				params: z.object({
					postId: z.string().uuid(),
				}),
				response: {
					201: z.object({
						id: z.string(),
					}),
					204: z.void(),
				},
			},
		},
		async (req, res) => {
			const { postId } = req.params
			const { sub } = req.user

			const getLikeResult = await sql`
        SELECT * FROM likes WHERE user_id = ${sub} AND post_id = ${postId}
      `

			const likeExist = getLikeResult[0] as Like | undefined
			if (likeExist) {
				await sql`DELETE FROM likes WHERE id = ${likeExist.id}`
				return res.status(204).send()
			}

			const id = createId()

			const result = await sql`
        INSERT INTO likes(id, user_id, post_id)
        VALUES (${id}, ${sub}, ${postId})
        RETURNING id
      `

			const like = result[0] as { id: string }

			return res.status(201).send({
				id: like.id,
			})
		}
	)
}
