import multer from 'fastify-multer'

export const upload = multer({
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB
	},
	fileFilter: (_req, file, callback) => {
		const allowedMimes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/pjpeg',
			'image/gif',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/pdf',
		]

		if (!allowedMimes.includes(file.mimetype)) {
			callback(new Error(`Mimetype inválido: ${file.mimetype} `))
			return
		}

		callback(null, true)
	},
})
