import { sql } from '@/lib/postgres.ts'
import { z } from 'zod'
import type { AuthLinkWithUser } from './types/user.ts'
import type { FastifyTypedInstance } from '@/types.ts'

export async function authenticateFromLink(app: FastifyTypedInstance) {
	app.get(
		'/links/authenticate',
		{
			schema: {
				tags: ['users'],
				description: 'Authenticate user from link',
				querystring: z.object({
					redirectUrl: z.string().url(),
					code: z.string().uuid(),
				}),
				response: {
					200: z.void(),
					400: z.object({
						status: z.literal(400),
						message: z.string(),
					}),
				},
			},
		},
		async (req, res) => {
			const { redirectUrl, code } = req.query

			const authLinkResult = await sql<AuthLinkWithUser[]>`
			  SELECT user_id, code, users.role FROM auth_links
				JOIN users 
				ON users.id = auth_links.user_id
				WHERE code = ${code}
			`

			const authLinkWithUser = authLinkResult[0]
			if (!authLinkWithUser)
				return res.status(400).send({
					status: 400,
					message: 'User not found.',
				})

			const token = await res.jwtSign(
				{
					role: authLinkWithUser.role.toLowerCase(),
				},
				{
					sub: authLinkWithUser.user_id,
				}
			)

			await sql`
				DELETE FROM auth_links WHERE code = ${authLinkWithUser.code}
			`

			const secondsInDay = 60 * 60 * 24

			// implement redirect

			return res
				.setCookie('auth', token, {
					path: '/',
					secure: true,
					httpOnly: true,
					sameSite: true,
					maxAge: secondsInDay, // 1 day
				})
				.status(200)
				.send()
		}
	)
}
