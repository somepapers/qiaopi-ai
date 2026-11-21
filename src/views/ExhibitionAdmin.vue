<script setup lang="ts">
import { t } from '@/i18n'
import { computed, onMounted, onBeforeUnmount, ref, reactive } from 'vue'
import { exhibitCaption } from '@/composables/useExhibitionCatalog'
import { put } from '@vercel/blob/client'
import type { Gallery, ExhibitionImage } from '@/types/exhibition'
import GalleryManager from '@/components/exhibition/GalleryManager.vue'

const session = ref<'checking' | 'login' | 'open' | 'unavailable'>('checking')
const password = ref('')
const error = ref('')
const status = ref('')
const uploadPercent = ref(0)
const busy = ref(false)
const managing = ref(false)
const manageGallery = ref<Gallery>('qiaopi')
const refreshList = ref(0)
const form = reactive({ gallery: 'qiaopi' as Gallery, title: '', credit: '', desc: '', titleEn: '', creditEn: '', descEn: '' })
const previewCaption = computed(() => exhibitCaption(form))
const chosen = ref<File>()
const preview = ref('')
const uploadId = ref('')
const picker = ref<HTMLInputElement>()
const published = ref<ExhibitionImage>()
const controller = new AbortController()

async function request<T>(action: string, body?: object, gallery?: Gallery): Promise<T> {
  const query = new URLSearchParams({ action })
  if (gallery) query.set('gallery', gallery)
  const res = await fetch('/api/exhibition?' + query, {
    method: body ? 'POST' : 'GET', signal: controller.signal,
    headers: body ? { 'Content-Type': 'application/json', 'X-Exhibition-Request': '1' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) {
      session.value = 'login'
      managing.value = false
      published.value = undefined
      error.value = data.message || '请重新登录团队后台'
    }
    throw new Error(data.message || '无法连接团队后台，请稍后再试')
  }
  return data as T
}
function report(e: unknown) {
  if (!controller.signal.aborted) error.value = e instanceof Error ? e.message : '网络连接中断，请重试'
}
async function checkSession() {
  session.value = 'checking'
  error.value = ''
  try { session.value = (await request<{authenticated: boolean}>('session')).authenticated ? 'open' : 'login' }
  catch (e) { session.value = 'unavailable'; report(e) }
}
async function login() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try { await request('login', { password: password.value }); session.value = 'open' }
  catch (e) { report(e) }
  finally { password.value = ''; busy.value = false }
}
async function logout() {
  busy.value = true
  error.value = ''
  try { await request('logout', {}); session.value = 'login'; reset() }
  catch (e) { report(e) }
  finally { busy.value = false }
}
function clearFile() {
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = ''
  chosen.value = undefined
  uploadId.value = ''
}
function reset() {
  clearFile()
  form.title = form.credit = form.desc = ''
  form.titleEn = form.creditEn = form.descEn = ''
  published.value = undefined
  error.value = status.value = ''
  if (picker.value) picker.value.value = ''
}
function pick(event: Event) {
  clearFile()
  error.value = status.value = ''
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size === 0 || file.size > 20 * 1024 * 1024) {
    error.value = '请选择 20 MB 以内的 JPG、PNG 或 WebP 图片'
    input.value = ''
    return
  }
  chosen.value = file
  uploadId.value = crypto.randomUUID()
  preview.value = URL.createObjectURL(file)
  if (!form.title) form.title = file.name.replace(/\.[^.]+$/, '').slice(0, 80)
}
function badPreview() {
  clearFile()
  if (picker.value) picker.value.value = ''
  error.value = '无法读取图片，请重新选择有效的图片文件'
}
type Authorization = { published: ExhibitionImage } | { uploaded: true } | { pathname: string, token: string }
async function publish() {
  const file = chosen.value
  if (busy.value || !file) return
  busy.value = true
  error.value = ''
  const identity = { id: uploadId.value, mime: file.type }
  try {
    status.value = '正在获取上传授权…'
    const auth = await request<Authorization>('authorize', { ...identity, size: file.size })
    if ('published' in auth) published.value = auth.published
    else {
      if ('token' in auth) {
        status.value = '正在上传原图…'
        let uploading = true
        try {
          await put(auth.pathname, file, {
            token: auth.token, access: 'public', contentType: file.type, abortSignal: controller.signal,
            onUploadProgress: progress => {
              if (uploading) {
                uploadPercent.value = Math.round(progress.percentage)
                status.value = '正在上传原图 · {percent}%'
              }
            },
          })
        } catch {
          throw new Error('原图上传未完成，请检查网络后重试发布')
        } finally { uploading = false }
      }
      status.value = '正在生成缩略图和详情图…'
      published.value = (await request<{ item: ExhibitionImage }>('publish', { ...identity, ...form })).item
    }
    manageGallery.value = published.value.gallery
    refreshList.value++
    clearFile()
  } catch (e) { report(e) }
  finally { busy.value = false; status.value = '' }
}
onMounted(checkSession)
onBeforeUnmount(() => { controller.abort(); clearFile() })
</script>

<template>
  <div class="studio">
    <RouterLink class="back" to="/exhibition">{{ t('← 返回展览馆') }}</RouterLink>
    <header><small>{{ t('寻侨迹，传侨魂 · 布展工作台') }}</small><h1>{{ t('团队展品管理') }}</h1><p>{{ t('为两个展厅发布作品、调整展示顺序，或恢复已撤下的展品。') }}</p></header>
    <p v-if="error" class="error" role="alert">{{ t(error) }}</p>
    <p v-if="session === 'checking'" role="status">{{ t('正在检查管理会话…') }}</p>
    <button v-else-if="session === 'unavailable'" class="secondary" @click="checkSession">{{ t('重新连接后台') }}</button>
    <form v-else-if="session === 'login'" class="panel login" @submit.prevent="login">
      <h2>{{ t('团队登录') }}</h2>
      <label>{{ t('共用管理口令') }}<input v-model="password" required type="password" autocomplete="current-password" /></label>
      <button class="primary" :disabled="busy">{{ t(busy ? '正在登录…' : '进入布展工作台') }}</button>
    </form>
    <template v-else>
      <div class="bar"><span>{{ t('团队管理会话已开启') }}</span><button :disabled="busy || managing" @click="logout">{{ t('退出登录') }}</button></div>
      <section v-if="published" class="panel success" role="status">
        <small>{{ t('发布完成') }}</small><h2>{{ t('《{title}》已上架', { title: exhibitCaption(published).title }) }}</h2>
        <p>{{ t('访客现在可以在{gallery}展区看到这件作品。', { gallery: t(published.gallery === 'ip' ? '团队 IP 设计' : '侨批文化展示') }) }}</p>
        <div class="actions">
          <RouterLink class="primary" :to="{ path: '/exhibition', query: { tab: published.gallery, work: published.id } }">{{ t('查看展品 ↗') }}</RouterLink>
          <button class="secondary" @click="reset">{{ t('继续添加作品') }}</button>
        </div>
      </section>
      <form v-else class="panel" @submit.prevent="publish">
        <fieldset :disabled="busy || managing">
          <legend>{{ t('新展品') }}</legend>
          <div class="fields">
            <div>
              <label for="exhibition-gallery">{{ t('展区') }}</label>
              <select id="exhibition-gallery" v-model="form.gallery"><option value="qiaopi">{{ t('侨批文化展示') }}</option><option value="ip">{{ t('团队 IP 设计') }}</option></select>
              <label>{{ t('展品图片') }}<input ref="picker" type="file" required accept="image/jpeg,image/png,image/webp" @change="pick" /></label>
              <p class="hint">{{ t('JPG、PNG 或 WebP · 单张不超过 20 MB') }}</p>
              <label>{{ t('作品标题') }}<input v-model.trim="form.title" required maxlength="80" /></label>
              <label>{{ t(form.gallery === 'ip' ? '设计署名' : '影像来源') }}<input v-model.trim="form.credit" required maxlength="120" /></label>
              <label>{{ t('展签说明（选填）') }}<textarea v-model.trim="form.desc" maxlength="600" rows="3"></textarea></label>
              <details>
                <summary>{{ t('英文展签（选填）') }}</summary>
                <label>{{ t('英文标题') }}<input v-model.trim="form.titleEn" lang="en" maxlength="160" /></label>
                <label>{{ t('英文来源或署名') }}<input v-model.trim="form.creditEn" lang="en" maxlength="240" /></label>
                <label>{{ t('英文说明') }}<textarea v-model.trim="form.descEn" lang="en" maxlength="1800" rows="3"></textarea></label>
              </details>
            </div>
            <div class="preview">
              <small>{{ t('发布预览') }}</small>
              <div class="mat"><img v-if="preview" :src="preview" :alt="t('所选展品的图片预览')" @error="badPreview" /><span v-else>{{ t('选图后可在此预览') }}</span></div>
              <h2>{{ previewCaption.title || t('作品标题') }}</h2><p>{{ previewCaption.credit || t('来源或设计署名') }}</p><p>{{ previewCaption.desc }}</p>
            </div>
          </div>
          <button class="primary" :disabled="!chosen || busy">{{ t(busy ? '正在发布…' : '发布到展览馆') }}</button>
        </fieldset>
        <p v-if="status" role="status" class="hint">{{ t(status, { percent: uploadPercent }) }}</p>
      </form>
      <GalleryManager v-model="manageGallery" :refresh="refreshList" :disabled="busy" :request="request"
        @saving="managing = $event" @trashed="id => { if (published?.id === id) reset() }" />
    </template>
  </div>
</template>

<style scoped>
.studio {
  max-width: 56rem;
  margin: 2rem auto 4rem;
  color: #38291e;
}
.back,.bar button {
  color: #814133;
  text-decoration: underline;
  text-underline-offset: .2em;
  font-size: .85rem;
}
header {
  margin: 1.5rem 0;
  padding: 1.4rem 0;
  border-block: 1px solid #70533744;
}
small,.hint,.bar {
  color: #78634e;
  font-size: .82rem;
}
header small,.success small,.preview small {
  letter-spacing: .14em;
  color: #903c30;
}
h1 {
  font-size: clamp(1.8rem,5vw,3rem);
  font-weight: 650;
  margin: .35rem 0;
}
header p,.preview p,.success p {
  color: #695746;
  line-height: 1.7;
}
.panel {
  background: #fffaf2;
  border: 1px solid #75533836;
  padding: clamp(1rem,3vw,2rem);
}
.login {
  max-width: 28rem;
}
h2,legend {
  font-size: 1.3rem;
  font-weight: 600;
}
.bar,.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.bar {
  justify-content: space-between;
  margin-bottom: 1rem;
}
label {
  display: block;
  font-size: .94rem;
  margin: .85rem 0 .3rem;
  font-weight: 550;
}
input,select,textarea {
  width: 100%;
  display: block;
  padding: .6rem .75rem;
  margin-top: .25rem;
  background: #fffefb;
  border: 1px solid #90785d80;
  font: inherit;
}
input[type=file] {
  font-size: .85rem;
}
input::file-selector-button {
  border: 1px solid #bca78d;
  background: #efe5d4;
  padding: .25rem .6rem;
  margin-right: .5rem;
}
.fields {
  display: grid;
  grid-template-columns: minmax(0,1.15fr) minmax(0,1fr);
  gap: 2rem;
}
.preview {
  align-self: start;
  margin-top: 1rem;
  padding: 1rem;
  background: #f4ebdc;
  overflow-wrap: anywhere;
}
.mat {
  aspect-ratio: 4/3;
  display: grid;
  place-items: center;
  background: #e8ddcc;
  position: relative;
  margin: .6rem 0;
  color: #796751;
  font-size: .85rem;
}
.mat img {
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: contain;
}
.primary,.secondary {
  display: inline-block;
  padding: .65rem 1.1rem;
  margin-top: .8rem;
}
.primary {
  background: #853a2d;
  color: #fff9ef;
}
.secondary {
  color: #773a30;
  border: 1px solid #ab8d73;
}
button:disabled {
  opacity: .55;
}
.error {
  background: #f6e5da;
  color: #862d21;
  padding: .75rem;
  margin: .8rem 0;
}
.hint {
  margin: .4rem 0;
}
@media(max-width:640px) {
  .fields {
    grid-template-columns: 1fr;
    gap: .5rem;
  }
  .studio {
    margin-top: 1rem;
  }
}
</style>
