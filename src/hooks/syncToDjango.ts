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
      signal: AbortSignal.timeout(10_000),
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
  // depth: 2 so upload nodes inside richText content (e.g. images) resolve
  // to their full media document (with a usable url) instead of a bare
  // media ID Django/the frontend would have no way to turn into a URL.
  const fullDoc = await req.payload.findByID({
    collection: 'articles',
    id: doc.id,
    locale: 'all',
    depth: 2,
  })

  // The locale-scoped refetch above can lag behind the write that just
  // happened (seen in practice: a locale's field reverting to an older
  // value even though `doc.updatedAt` is current). `doc` is the actual
  // result of this save, so it's authoritative for whichever locale was
  // just written — patch it back over the refetched value for that locale.
  // `locale: 'all'` makes each localized field an object keyed by locale
  // at runtime, which the generated single-locale types don't model, so
  // this patch step works through an untyped view of the document.
  const savedLocale = req.locale
  if (savedLocale) {
    const fullDocFields = fullDoc as unknown as Record<string, Record<string, unknown> | undefined>
    const docFields = doc as unknown as Record<string, unknown>
    for (const field of ['title', 'slug', 'content'] as const) {
      if (docFields[field] !== undefined) {
        fullDocFields[field] = { ...fullDocFields[field], [savedLocale]: docFields[field] }
      }
    }
  }

  // Fire-and-forget: the admin save shouldn't hang on Django's
  // availability or response time. Errors are logged inside postToDjango.
  void postToDjango({ operation, doc: fullDoc })
  return doc
}

export const syncDeleteToDjango: CollectionAfterDeleteHook = async ({ doc }) => {
  void postToDjango({ operation: 'delete', doc })
  return doc
}
