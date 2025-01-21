import type { FastifyInstance } from 'fastify'
import postgres from 'postgres'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (err, _, res) => {
	if (err instanceof ZodError) {
		return res.status(400).send({
			message: err.message,
			errors: fromZodError(err),
		})
	}

	if (err instanceof postgres.PostgresError) {
		if (err.code === '23505') {
			return res.status(400).send({ message: 'Duplicated code!' })
		}
	}

	return res.status(500).send({ message: 'Internal server error!' })
}
