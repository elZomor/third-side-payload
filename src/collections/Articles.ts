import type { CollectionConfig } from 'payload'

import { syncDeleteToDjango, syncToDjango } from '../hooks/syncToDjango'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      localized: true,
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },
    {
      // Per language: tick when that language's text was machine-translated.
      // Shown as an "AI" tag on the site. Ignored for the original language.
      name: 'aiGenerated',
      type: 'checkbox',
      localized: true,
      defaultValue: false,
      label: 'AI-generated translation',
      admin: {
        description: 'Tick for a language whose text was machine-translated. Untick once a person has reviewed it.',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['ready_for_review', 'in_review', 'approved', 'rejected'],
      defaultValue: 'ready_for_review',
      required: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
  ],
  hooks: {
    afterChange: [syncToDjango],
    afterDelete: [syncDeleteToDjango],
  },
}
