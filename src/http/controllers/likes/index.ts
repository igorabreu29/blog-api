import type { FastifyTypedInstance } from '@/types.ts'
import { addOrRemoveLikeFromPost } from './add-or-remove-like-from-post.ts'

export async function likeRoutes(app: FastifyTypedInstance) {
	app.register(addOrRemoveLikeFromPost)
}
