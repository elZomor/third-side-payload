import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload'

type LexicalNode = {
  type?: string
  relationTo?: string
  value?: unknown
  children?: LexicalNode[]
  [key: string]: unknown
}

// `depth` on findByID doesn't reach into richText content when combined
// with `locale: 'all'` — upload nodes still come back as a bare media id
// (verified against the actual synced payload). Walk the tree ourselves
// and swap each unpopulated upload node's value for the real media doc,
// so Django/the frontend get a usable url instead of a number.
async function populateUploadNodes(node: LexicalNode, payload: Payload, cache: Map<string, unknown>) {
  if (node.type === 'upload' && node.relationTo && node.value !== undefined && typeof node.value !== 'object') {
    const cacheKey = `${node.relationTo}:${node.value}`
    if (!cache.has(cacheKey)) {
      try {
        const media = await payload.findByID({
          collection: node.relationTo as 'media',
          id: node.value as string | number,
          depth: 0,
        })
        cache.set(cacheKey, media)
      } catch {
        cache.set(cacheKey, node.value)
      }
    }
    node.value = cache.get(cacheKey)
  }

  if (node.children) {
    await Promise.all(node.children.map((child) => populateUploadNodes(child, payload, cache)))
  }
}

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
  // (depth doesn't populate relations nested inside richText content when
  // combined with locale: 'all' — see populateUploadNodes below, which
  // handles upload nodes manually instead.)
  const fullDoc = await req.payload.findByID({
    collection: 'articles',
    id: doc.id,
    locale: 'all',
    depth: 0,
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

  const contentByLocale = (fullDoc as unknown as { content?: Record<string, { root?: LexicalNode } | undefined> })
    .content
  if (contentByLocale) {
    const mediaCache = new Map<string, unknown>()
    await Promise.all(
      Object.values(contentByLocale).map((localeContent) =>
        localeContent?.root ? populateUploadNodes(localeContent.root, req.payload, mediaCache) : undefined
      )
    )
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
