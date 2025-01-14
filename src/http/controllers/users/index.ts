import type { FastifyTypedInstance } from '@/types.ts'
import { createUser } from './create-user.ts'
import { signIn } from './sign-in.ts'
import { authenticateWithEmail } from './authenticate-with-email.ts'
import { getUserProfile } from './get-user-profile.ts'
import { updateUserProfile } from './update-user-profile.ts'

export async function userRoutes(app: FastifyTypedInstance) {
	app.register(createUser)
	app.register(signIn)
	app.register(authenticateWithEmail)
	app.register(getUserProfile)
	app.register(updateUserProfile)
}
