import { kv } from '@vercel/kv'
import { builtInFiles } from './builtins.js'
import { withImageDelivery } from './image-delivery.js'
import type { CatalogAction, ExhibitionCatalog, ExhibitionImage, Gallery } from '../../src/types/exhibition.js'

export const prefix = 'qiaopi:exhibition:'
export class Problem extends Error {
  status: number
  constructor(status: number, message: string) { super(message); this.status = status }
}

interface Entry {
  work: string | ExhibitionImage
  hidden?: boolean
}
export interface CatalogState {
  revision: number
  entries: Entry[]
}
const catalogKey = (gallery: Gallery) => prefix + 'catalog:' + gallery
const idOf = (entry: Entry) => typeof entry.work === 'string' ? entry.work : entry.work.id
const conflict = () => new Problem(409, '展区目录已更新，请刷新列表后重试')

export function initialCatalog(gallery: Gallery, uploads: ExhibitionImage[] = []): CatalogState {
  return { revision: 0, entries: [
    ...builtInFiles(gallery).map(name => ({ work: gallery + '-' + name })),
    ...uploads.map(work => ({ work })),
  ] }
}

export async function readCatalog(gallery: Gallery): Promise<CatalogState> {
  const saved = await kv.get<CatalogState>(catalogKey(gallery))
  if (!saved) {
    const uploads = await kv.zrange<ExhibitionImage[]>(prefix + 'gallery:' + gallery, 0, -1, { rev: true })
    return initialCatalog(gallery, uploads)
  }
  // A later site build may add or remove bundled images. Keep existing slots, including hidden ones.
  const newIds = new Set(builtInFiles(gallery).map(name => gallery + '-' + name))
  const entries = saved.entries.filter(({ work }) => typeof work !== 'string' || newIds.delete(work))
  entries.push(...Array.from(newIds, work => ({ work })))
  return { revision: saved.revision, entries }
}

export function catalogPage(state: CatalogState, hidden = false): ExhibitionCatalog {
  const entries = state.entries.filter(entry => Boolean(entry.hidden) === hidden)
  return {
    order: entries.map(idOf),
    items: entries.flatMap(({ work }) => typeof work === 'string' ? [] : [withImageDelivery(work)]),
  }
}
export function managedCatalog(state: CatalogState) {
  return { ...catalogPage(state), revision: state.revision, trash: catalogPage(state, true) }
}

export function changeCatalog(state: CatalogState, action: CatalogAction, body: Record<string, unknown>): CatalogState {
  if (body.revision !== state.revision) throw conflict()
  const entries = [...state.entries]
  const index = entries.findIndex(entry => idOf(entry) === body.id)
  const entry = entries[index]
  if (!entry || Boolean(entry.hidden) !== (action === 'restore')) throw new Problem(400, '作品不在所选列表中')
  if (action === 'move') {
    const step = body.direction
    if (step !== -1 && step !== 1) throw new Problem(400, '请选择上移或下移')
    let next = index + step
    while (entries[next]?.hidden) next += step
    if (!entries[next]) throw new Problem(400, '作品已在列表边界')
    entries[index] = entries[next]
    entries[next] = entry
  } else {
    entries[index] = action === 'trash' ? { work: entry.work, hidden: true } : { work: entry.work }
  }
  return { revision: state.revision + 1, entries }
}

// A publication commits the upload receipt and the new gallery order together.
// A stale edit (including a retry after a lost response) cannot swap two works twice.
async function commit(gallery: Gallery, next: CatalogState, item?: ExhibitionImage) {
  const keys = [catalogKey(gallery)]
  if (item) keys.push(prefix + item.id)
  return kv.eval<[number, string, string], number>(
    `local current = redis.call('GET', KEYS[1])
     if KEYS[2] and redis.call('EXISTS', KEYS[2]) == 1 then return 2 end
     local revision = current and cjson.decode(current).revision or 0
     if revision ~= tonumber(ARGV[1]) then return 0 end
     redis.call('SET', KEYS[1], ARGV[2])
     if KEYS[2] then redis.call('SET', KEYS[2], ARGV[3]) end
     return 1`, keys, [next.revision - 1, JSON.stringify(next), item ? JSON.stringify(item) : ''],
  )
}

export async function editCatalog(gallery: Gallery, action: CatalogAction, body: Record<string, unknown>) {
  const next = changeCatalog(await readCatalog(gallery), action, body)
  if (!await commit(gallery, next)) throw conflict()
  return managedCatalog(next)
}

export async function publishedItem(id: string) {
  const item = await kv.get<ExhibitionImage>(prefix + id)
  if (item && (await readCatalog(item.gallery)).entries.some(entry => idOf(entry) === id && entry.hidden)) {
    throw new Problem(409, '这件作品已移入回收站，可在后台恢复')
  }
  return item
}

export async function appendPublication(item: ExhibitionImage): Promise<ExhibitionImage> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const state = await readCatalog(item.gallery)
    const next = { revision: state.revision + 1, entries: [...state.entries, { work: item }] }
    const result = await commit(item.gallery, next, item)
    if (result === 1) return item
    if (result === 2) {
      const existing = await publishedItem(item.id)
      if (existing) return existing
    }
  }
  throw conflict()
}
