import type { FastifyTypedInstance } from '@/types.ts'
import { addCommentToPost } from './add-comment-to-post.ts'
import { editComment } from './edit-comment.ts'
import { deleteComment } from './delete-comment.ts'

export async function commentRoutes(app: FastifyTypedInstance) {
	app.register(addCommentToPost)
	app.register(editComment)
	app.register(deleteComment)
}
