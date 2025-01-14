import type { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyJWT(req: FastifyRequest, res: FastifyReply) {
	try {
		await req.jwtVerify({ onlyCookie: true })
	} catch (error) {
		return res.status(401).send({ message: 'Unathourized.' })
	}
}
