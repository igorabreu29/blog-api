import type { FastifyTypedInstance } from '@/types.ts'
import { followAccount } from './follow-account.ts'

export async function followRoutes(app: FastifyTypedInstance) {
	app.register(followAccount)
}
