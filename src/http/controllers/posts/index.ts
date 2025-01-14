import type { FastifyTypedInstance } from '@/types.ts'
import { createPost } from './create-post.ts'
import { editPost } from './edit-post.ts'
import { deletePost } from './delete-post.ts'
import { getPosts } from './get-posts.ts'

export async function postRoutes(app: FastifyTypedInstance) {
	app.register(getPosts)
	app.register(createPost)
	app.register(editPost)
	app.register(deletePost)
}
