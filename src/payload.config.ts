import { postgresAdapter } from '@payloadcms/db-postgres'
import {
  BlocksFeature,
  defaultColors,
  FixedToolbarFeature,
  lexicalEditor,
  TextStateFeature,
} from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { VideoEmbed } from './blocks/VideoEmbed'
import { Articles } from './collections/Articles'
import { Media } from './collections/Media'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Articles, Media],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      BlocksFeature({ blocks: [VideoEmbed] }),
      // Font size and text color controls. Stored as flat state keys on the
      // text node (`node.fontSize`, `node.color`) rather than arbitrary CSS,
      // so the frontend renderer maps these same keys to CSS itself
      // (see third_side_frontend/app/components/LexicalContent.tsx).
      TextStateFeature({
        state: {
          fontSize: {
            sm: { css: { 'font-size': '0.875rem' }, label: 'Small' },
            base: { css: { 'font-size': '1rem' }, label: 'Normal' },
            lg: { css: { 'font-size': '1.25rem' }, label: 'Large' },
            xl: { css: { 'font-size': '1.5rem' }, label: 'Extra Large' },
          },
          color: { ...defaultColors.text },
        },
      }),
    ],
  }),
  localization: {
    locales: ['ar', 'en'],
    defaultLocale: 'ar',
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  plugins: [
    // Same AWS S3 bucket tickets-be already uploads to, kept under its own
    // prefix so Payload's media can't collide with that app's files.
    s3Storage({
      collections: {
        media: {
          prefix: 'payload-media',
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        region: process.env.S3_REGION,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
