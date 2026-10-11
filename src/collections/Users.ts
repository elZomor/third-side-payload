import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  // useAPIKey lets Django authenticate as a Payload user (Authorization:
  // users API-Key <key>) to create articles via the REST API.
  auth: { useAPIKey: true },
  fields: [],
}
