import type { LetterInput, Relationship } from '@/types/letter'

// 侨批封题字工具：由信件输入生成红条封上的竖排题字
// （中央红条称谓、右侧寄达地、左侧汇款金额与寄款人）

// 中央红条：启封敬辞，题于收信人名讳之下，按尊卑有别
// （古批封题式如「陈集允胞兄亲收」「许母李氏安启」：名讳直书，下缀敬辞）
const ENVELOPE_SUFFIX: Record<Relationship, string> = {
  parents: '安启',
  father: '安启',
  mother: '安启',
  wife: '亲启',
  husband: '安启',
  son: '收启',
  daughter: '收启',
  older_brother: '台启',
  younger_brother: '台启',
  older_sister: '妆次',
  younger_sister: '妆次',
  grandfather: '安启',
  grandmother: '安启',
  uncle: '安启',
  aunt: '安启',
  friend: '台启',
  teacher: '安启',
  other: '台启',
}

// 中央红条：未填收信人名字时的回退称谓（称谓 + 安展/台展 等敬辞）
const ENVELOPE_TITLE: Record<Relationship, string> = {
  parents: '双亲大人安展',
  father: '家严大人安展',
  mother: '家慈大人安展',
  wife: '贤妻如晤',
  husband: '夫君大人安展',
  son: '吾儿知悉',
  daughter: '吾女知悉',
  older_brother: '家兄大人台展',
  younger_brother: '贤弟台展',
  older_sister: '家姊妆次',
  younger_sister: '贤妹妆次',
  grandfather: '祖父大人安展',
  grandmother: '祖母大人安展',
  uncle: '叔父大人安展',
  aunt: '姑母大人安展',
  friend: '仁兄台展',
  teacher: '夫子大人安展',
  other: '台启展',
}

const DAXIE = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const DAXIE_UNITS = ['', '拾', '佰', '仟']

// 纯数字金额转中文大写（侨批封「外银」惯用大写），仅处理 1~9999，其余原样
function intToDaxie(n: number): string {
  if (n === 0) return '零'
  if (n < 1 || n > 9999) return String(n)
  const s = String(n)
  const len = s.length
  let out = ''
  let pendingZero = false
  for (let i = 0; i < len; i++) {
    const d = Number(s[i])
    if (d === 0) {
      pendingZero = true
    } else {
      if (pendingZero) { out += '零'; pendingZero = false }
      out += DAXIE[d] + DAXIE_UNITS[len - 1 - i]
    }
  }
  return out
}

function formatAmount(raw: string): string {
  const m = raw.trim().match(/^(\d{1,4})\s*元?$/)
  if (m) return `外附 ${intToDaxie(Number(m[1]))}元正`
  return `外附 ${raw.trim()}`
}

export interface EnvelopeText {
  title: string
  toText: string
  amountText: string
  senderText: string
}

export function buildEnvelopeText(input: Partial<LetterInput> | null | undefined): EnvelopeText {
  const rel = input?.relationship
  const recipientName = input?.recipient?.trim()
  const title = recipientName
    ? `${recipientName}　${(rel && ENVELOPE_SUFFIX[rel]) || '台启'}`
    : (rel && ENVELOPE_TITLE[rel]) || '台启展'

  const to = input?.toLocation?.trim()
  const toText = `${to || '唐山故里'}　交`

  const amt = input?.remittanceAmount?.trim()
  const amountText = amt ? formatAmount(amt) : ''

  const from = input?.fromLocation?.trim() || '南洋'
  const name = input?.senderName?.trim() || '游子'
  const senderText = `${from}　${name}　缄`

  return { title, toText, amountText, senderText }
}
