import assert from 'node:assert/strict'
import test from 'node:test'
import { records } from '../src/data/practice.ts'
import { mediaItems } from '../src/data/media.ts'
import { templateData } from '../src/utils/templateData.ts'
import { setLocale, t } from '../src/i18n/index.ts'
import { decodeLetter, encodeLetter } from '../src/utils/share.ts'

test('published field notes, photos, articles and complete sample letters have English text', () => {
  const copy = [
    ...records.filter(record => record.status === 'published').flatMap(record => [
      record.title, record.station, record.city, record.theme, record.location, record.summary,
      record.lead, ...record.paragraphs, ...(record.tags ?? []), ...record.photos.flatMap(p => [p.caption, p.alt]),
    ]),
    ...mediaItems.flatMap(item => [item.title, item.summary, ...item.sources.map(source => source.label)]),
    ...templateData.flatMap(letter => [
      letter.title, letter.description, letter.example, ...letter.tags,
      ...letter.structure.flatMap(section => [section.label, section.example]),
    ]),
  ].filter(Boolean)
  setLocale('en')
  for (const text of copy) {
    assert.ok(t(text).trim(), text)
    assert.doesNotMatch(t(text), /\p{Script=Han}/u, text)
  }
  setLocale('zh-CN')
  for (const text of copy) assert.equal(t(text), text)
})

test('English and legacy Chinese share links preserve the letter and its reading layout', () => {
  for (const locale of [undefined, 'en']) {
    const content = locale ? 'Dear Mother,\nI am well.' : '母亲大人膝下：平安。'
    const saved = decodeLetter(encodeLetter({ v: 1, content, locale }))
    assert.equal(saved.content, content)
    assert.equal(saved.locale, locale ?? 'zh-CN')
  }
})
