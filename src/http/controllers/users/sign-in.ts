import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { transporter } from '@/lib/mailer.ts'
import { createId } from '@/utils/create-id.ts'
import type { User } from './types/user.ts'
import { env } from '@/env/index.ts'

export async function signIn(app: FastifyTypedInstance) {
	app.post(
		'/sign-in',
		{
			schema: {
				tags: ['users'],
				description: 'Sign in user',
				body: z.object({
					email: z.string().email(),
				}),
				response: {
					201: z.void(),

					400: z.object({
						status: z.literal(400),
						message: z.string(),
					}),
				},
			},
		},
		async (req, res) => {
			const { email } = req.body

			const getResult = await sql<Pick<User, 'id' | 'email'>[]>`
				SELECT id, email FROM users WHERE email = ${email}
			`

			const userWithEmail = getResult[0]
			if (!userWithEmail)
				return res.status(400).send({
					status: 400,
					message: 'User not found.',
				})

			const id = createId()
			const code = createId()

			await sql`
				INSERT INTO auth_links
				VALUES (${id}, ${code}, ${userWithEmail.id})
			`

			const authLink = new URL('/authenticate', env.API_URL)
			authLink.searchParams.set('code', code)
			authLink.searchParams.set('redirectUrl', env.AUTH_REDIRECT_URL)

			transporter.sendMail({
				from: 'blog-application@gmail.com',
				to: userWithEmail.email,
				html: `
          <h1>Faça login na aplicação</h1>
          <hr />
          <p>Olá, ao clicar na no botão, você será redirecionado para nossa plataforma e automaticamente será logado.</p> 
          
          <button>
            <a target="_blank" rel="noopener noreferrer" href=${authLink.toString()}>Login.</a>
          </button>
        `,
			})

			return res.status(201).send()
		}
	)
}
