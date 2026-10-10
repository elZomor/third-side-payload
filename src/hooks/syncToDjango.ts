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

export const syncToDjango: CollectionAfterChangeHook = async ({ doc, operation }) => {
  if (doc.status !== 'published') return doc

  await postToDjango({ operation, doc })
  return doc
}

export const syncDeleteToDjango: CollectionAfterDeleteHook = async ({ doc }) => {
  await postToDjango({ operation: 'delete', doc })
  return doc
}
