import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import test from 'node:test'
import { catalogPage, changeCatalog, initialCatalog, managedCatalog } from '../server/exhibition/catalog.ts'
import exhibition from '../server/exhibition/handler.ts'

const upload = {
  id: 'online-1', gallery: 'qiaopi', title: '测试展品', credit: '团队', thumb: '/thumb', detail: '/detail',
}
function edit(state, action, id, direction) {
  return changeCatalog(state, action, { id, direction, revision: state.revision })
}

test('初始目录涵盖两区内置图片，保留旧目录提供的上传顺序', async () => {
  for (const gallery of ['qiaopi', 'ip']) {
    const files = await readdir(new URL('../src/assets/exhibition/' + gallery + '/', import.meta.url))
    const names = files.filter(name => name.endsWith('.thumb.webp')).map(name => name.slice(0, -'.thumb.webp'.length))
    assert.deepEqual(new Set(catalogPage(initialCatalog(gallery)).order), new Set(names.map(name => gallery + '-' + name)))
  }
  const older = { ...upload, id: 'online-2' }
  const page = catalogPage(initialCatalog('qiaopi', [upload, older]))
  assert.deepEqual(page.items, [upload, older])
  assert.deepEqual(page.order.slice(-2), [upload.id, older.id])
})

test('内置与上传作品可以混排，跳过回收站位置，恢复后保留展签和链接', () => {
  const base = initialCatalog('qiaopi', [upload])
  const initialOrder = catalogPage(base).order
  const before = initialOrder.at(-3)
  const lastBuiltIn = initialOrder.at(-2)
  let state = edit(base, 'trash', lastBuiltIn)
  state = edit(state, 'move', upload.id, -1)
  assert.deepEqual(catalogPage(state).order.slice(-2), [upload.id, before])
  state = edit(state, 'restore', lastBuiltIn)
  assert.deepEqual(catalogPage(state).order.slice(-3), [upload.id, lastBuiltIn, before])
  state = edit(state, 'trash', upload.id)
  assert.deepEqual(catalogPage(state).items, [])
  assert.deepEqual(managedCatalog(state).trash, { order: [upload.id], items: [upload] })
  state = edit(state, 'restore', upload.id)
  assert.deepEqual(catalogPage(state).items, [upload])
  assert.deepEqual(catalogPage(base).order, initialOrder)
})

test('空展区与单件作品、跨展区、非法方向及过期保存', () => {
  let state = initialCatalog('ip')
  const ids = catalogPage(state).order
  for (const id of ids.slice(1)) state = edit(state, 'trash', id)
  for (const step of [-1, 1, 0]) assert.throws(() => edit(state, 'move', ids[0], step), { status: 400 })
  assert.throws(() => edit(state, 'trash', 'qiaopi-侨批4.jpg'), { status: 400 })
  assert.throws(() => changeCatalog(state, 'trash', { id: ids[0], revision: 0 }), { status: 409 })
  state = edit(state, 'trash', ids[0])
  assert.deepEqual(catalogPage(state), { items: [], order: [] })
  assert.throws(() => edit(state, 'move', ids[0], 1), { status: 400 })
  assert.deepEqual(catalogPage(edit(state, 'restore', ids[0])).order, [ids[0]])
})

test('公开目录仅含在展作品，回收站和写操作需要登录', async t => {
  const original = process.env
  process.env = { ...original }
  t.after(() => { process.env = original })
  delete process.env.KV_REST_API_URL
  delete process.env.KV_REST_API_TOKEN
  async function call(method, query, headers = {}) {
    const response = { setHeader() {}, status(code) { this.code = code; return this }, json(data) { this.data = data } }
    await exhibition({ method, query, headers, socket: {} }, response)
    return response
  }
  const guest = await call('GET', { gallery: 'ip' })
  assert.equal(guest.code, 200)
  assert.deepEqual(guest.data, catalogPage(initialCatalog('ip')))
  Object.assign(process.env, { EXHIBITION_ADMIN_PASSWORD: 'test', KV_REST_API_URL: 'http://127.0.0.1:1',
    KV_REST_API_TOKEN: 'test', BLOB_READ_WRITE_TOKEN: 'test' })
  assert.equal((await call('GET', { action: 'manage', gallery: 'ip' })).code, 401)
  for (const action of ['move', 'trash', 'restore']) {
    const response = await call('POST', { action }, { 'content-type': 'application/json', 'x-exhibition-request': '1' })
    assert.equal(response.code, 401)
  }
})
