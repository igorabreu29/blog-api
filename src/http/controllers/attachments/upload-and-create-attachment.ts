import type { FastifyTypedInstance } from '@/types.ts'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { upload } from '@/lib/multer.ts'
import { createId } from '@/utils/create-id.ts'
import { s3Client } from '@/lib/s3-client.ts'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '@/env/index.ts'
import { sql } from '@/lib/postgres.ts'
import type { Attachment } from './types/attachment.ts'

export async function uploadAndCreateAttachment(app: FastifyTypedInstance) {
  app.post(
    '/attachments',
    {
      onRequest: [verifyJWT],
      preHandler: upload.single('attachment'),
      schema: {
        tags: ['attachments'],
        description: 'Upload and create a new attachment',
        response: {
          201: z.object({
            attachment: z.object({
              id: z.string(),
              url: z.string()
            })
          }),
        },
      },
    },
    async (req, res) => {
		const assessmentFileSchema = z.object({
				originalname: z.string(),
        mimetype: z.string(),
        buffer: z.instanceof(Buffer)
			})

			const { originalname, buffer, mimetype } = assessmentFileSchema.parse(req.file)

      const uploadId = createId()
      const fileName = `${uploadId}-${originalname}`

      await s3Client.send(new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: fileName,
        ContentType: mimetype,
        Body: buffer
      }))
 
      const insertAttachmentResult = await sql`
        INSERT INTO attachments (id, url) 
        VALUES (${createId()}, ${fileName}) 
      `

      const attachment = insertAttachmentResult[0] as Attachment

      return res.status(201).send({ attachment })
    }
  )
}
