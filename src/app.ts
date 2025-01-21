import { fastify } from 'fastify'
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { env } from './env/index.ts'
import { postRoutes } from './http/controllers/posts/index.ts'
import { userRoutes } from './http/controllers/users/index.ts'
import { likeRoutes } from './http/controllers/likes/index.ts'
import { commentRoutes } from './http/controllers/comments/index.ts'
import { followRoutes } from './http/controllers/followers/index.ts'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: 'Post API',
			version: '1.0.0',
		},
	},
	transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
	routePrefix: '/docs',
})

app.register(fastifyCookie)
app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
	cookie: {
		cookieName: 'auth',
		signed: false,
	},
})

app.register(userRoutes)
app.register(postRoutes)
app.register(likeRoutes)
app.register(commentRoutes)
app.register(followRoutes)
