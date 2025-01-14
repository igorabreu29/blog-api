import type { FastifyReply, FastifyRequest } from 'fastify'

export function verifyUserRole(rolesToVerify: string) {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		const { role } = request.user as { role: string }

		if (rolesToVerify !== role) {
			return reply.status(401).send({ message: 'Unauthorized.' })
		}
	}
}
