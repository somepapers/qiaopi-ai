import type { LetterInput } from '../../src/types/letter.js'

export function englishLetterMessages(input: LetterInput) {
  const date = new Intl.DateTimeFormat('en-u-ca-chinese', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai',
  }).format(new Date())
  const system = [
    'Write a family letter in English in the tradition of qiaopi, the letters that accompanied remittances from overseas Chinese.',
    'Use the sender’s message as your source. Keep the names, relationships, news, requests and feelings faithful to what they supplied. Never invent a remittance, currency, signature or biographical detail.',
    'Address the recipient naturally in English and follow the requested tone. If an amount is given, spell it out in English and retain the currency.',
    'Close with good wishes suited to the relationship, the supplied signature when available, and the lunar date ' + date + '.',
    'Return only the English letter, in paragraphs, without headings, commentary or a Chinese translation.',
  ].join('\n')
  return [
    { role: 'system', content: system },
    { role: 'user', content: JSON.stringify(input) },
  ]
}
