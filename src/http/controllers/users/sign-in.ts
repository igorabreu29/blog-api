import { sql } from '@/lib/postgres.ts'
import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { transporter } from '@/lib/mailer.ts'

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

			const getResult = await sql`
				SELECT email FROM users WHERE email = ${email}
			`

			const userWithEmail = getResult[0] as { email: string } | undefined
			if (!userWithEmail)
				return res.status(400).send({
					status: 400,
					message: 'User not found.',
				})

			transporter.sendMail({
				from: 'blog-application@gmail.com',
				to: userWithEmail.email,
				html: `
          <h1>Faça login na aplicação</h1>
          <hr />
          <p>Olá, ao clicar na no botão, você será redirecionado para nossa plataforma e automaticamente será logado.</p> 
          
          <button>
            <a target="_blank" rel="noopener noreferrer" href=http://localhost:3333/authenticate-with-email?email=${userWithEmail.email}>Login.</a>
          </button>
        `,
			})

			return res.status(201).send()
		}
	)
}
