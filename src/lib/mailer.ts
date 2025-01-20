import nodemailer from 'nodemailer'

const config = {
	host: 'smtp.ethereal.email',
	port: 587,
	auth: {
		user: 'yesenia.okuneva@ethereal.email',
		pass: 'HjUATNu8rbfU62cqMU',
	},
}

export const transporter = nodemailer.createTransport(config)
