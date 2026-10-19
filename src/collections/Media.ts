import { randomUUID } from 'node:crypto'
import path from 'node:path'

import type { CollectionConfig } from 'payload'

// S3 keys are written as raw Unicode but media.play-cast.com (the Worker in
// front of the bucket) re-encodes the path, so a non-ASCII filename (e.g.
// Arabic) can miss the object and surface as S3 AccessDenied. Keep keys to
// plain ASCII: slugify what's left of the name, or fall back to a short id.
const toAsciiFilename = (original: string): string => {
  const ext = path.extname(original).toLowerCase().replace(/[^.a-z0-9]/g, '')
  const base = path
    .basename(original, path.extname(original))
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return `${base || 'media'}-${randomUUID().slice(0, 8)}${ext}`
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeOperation: [
      ({ args, operation, req }) => {
        if (operation === 'create' && req.file?.name && /[^\x20-\x7e]/.test(req.file.name)) {
          req.file.name = toAsciiFilename(req.file.name)
        }
        return args
      },
    ],
  },
  upload: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
}
