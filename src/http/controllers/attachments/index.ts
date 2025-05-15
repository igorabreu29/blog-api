import type { FastifyTypedInstance } from '@/types.ts'
import { uploadAndCreateAttachment } from './upload-and-create-attachment.ts'

export async function attachmentRoutes(app: FastifyTypedInstance) {
  app.register(uploadAndCreateAttachment)
}
