import type { FastifyTypedInstance } from '@/types.ts'
import { createPost } from './create-post.ts'
import { editPost } from './edit-post.ts'
import { deletePost } from './delete-post.ts'

export async function postRoutes(app: FastifyTypedInstance) {
	app.register(createPost)
	app.register(editPost)
	app.register(deletePost)
}
