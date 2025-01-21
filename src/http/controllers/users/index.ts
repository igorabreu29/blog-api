import type { FastifyTypedInstance } from '@/types.ts'
import { createUser } from './create-user.ts'
import { signIn } from './sign-in.ts'
import { getUserProfile } from './get-user-profile.ts'
import { updateUserProfile } from './update-user-profile.ts'
import { authenticateFromLink } from './authenticate-from-link.ts'

export async function userRoutes(app: FastifyTypedInstance) {
	app.register(createUser)
	app.register(signIn)
	app.register(authenticateFromLink)
	app.register(getUserProfile)
	app.register(updateUserProfile)
}
