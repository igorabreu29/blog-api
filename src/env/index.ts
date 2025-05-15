import { z } from 'zod'

export const envSchema = z.object({
	NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
	PORT: z.coerce.number().default(3333),
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string(),
	API_URL: z.string().url(),
	AUTH_REDIRECT_URL: z.string().url(),
	CLOUDFLARE_ACCOUNT_ID: z.string(),
	R2_ACCESS_KEY_ID: z.string(),
	R2_SECRET_ACCESS_KEY: z.string(),
	R2_BUCKET_NAME: z.string(),
	MAIL_HOST: z.string(),
	MAIL_PORT: z.coerce.number(),
	MAIL_USER: z.string(),
	MAIL_PASS: z.string(),
})

export const env = envSchema.parse(process.env)
