import nodemailer from 'nodemailer'

const config = {
	host: 'smtp.ethereal.email',
	port: 587,
	auth: {
		user: 'shaylee.rodriguez99@ethereal.email',
		pass: 'VVCtVaE3pA8GjXj6aA',
	},
}

export const transporter = nodemailer.createTransport(config)
