import { env } from '@/env/index.ts'
import nodemailer from 'nodemailer'

const config = {
	host: env.MAIL_HOST,
	port: env.MAIL_PORT,
	auth: {
		user: env.MAIL_USER,
		pass: env.MAIL_PASS,
	},
}

export const transporter = nodemailer.createTransport(config)
