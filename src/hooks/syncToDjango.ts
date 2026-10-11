import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

async function postToDjango(body: Record<string, unknown>): Promise<void> {
  const url = process.env.DJANGO_WEBHOOK_URL
  const secret = process.env.PAYLOAD_WEBHOOK_SECRET

  if (!url || !secret) {
    console.error('DJANGO_WEBHOOK_URL or PAYLOAD_WEBHOOK_SECRET not set, skipping sync')
    return
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': secret,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error(`Django sync failed: ${res.status} ${await res.text()}`)
    }
  } catch (err) {
    console.error('Django sync request failed', err)
  }
}

export const syncToDjango: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (doc.status !== 'published') return doc

  // `doc` only carries the locale that was just saved. Fetch the full
  // multi-locale document so title/slug/content for every locale reach
  // Django in one go, instead of overwriting each other on every save.
  const fullDoc = await req.payload.findByID({
    collection: 'articles',
    id: doc.id,
    locale: 'all',
    depth: 0,
  })

  await postToDjango({ operation, doc: fullDoc })
  return doc
}

export const syncDeleteToDjango: CollectionAfterDeleteHook = async ({ doc }) => {
  await postToDjango({ operation: 'delete', doc })
  return doc
}
