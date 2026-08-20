import type { Relationship } from '../types/letter'

export const relationshipOptions: { value: Relationship; label: string; salutation: string; blessing: string; signature: string }[] = [
  { value: 'parents', label: '父母', salutation: '双亲大人膝下', blessing: '耑此跪禀，恭请福安。', signature: '男 阿福 叩禀' },
  { value: 'father', label: '父亲', salutation: '父亲大人尊前', blessing: '耑此跪禀，恭请福安。', signature: '男 阿福 叩禀' },
  { value: 'mother', label: '母亲', salutation: '母亲大人膝下', blessing: '耑此跪禀，恭请金安。', signature: '男 阿福 叩禀' },
  { value: 'wife', label: '妻子', salutation: '贤妻妆次', blessing: '专此奉达，顺颂妆安。', signature: '夫 阿福 手启' },
  { value: 'son', label: '儿子', salutation: '吾儿收知', blessing: '手此，并祝进步。', signature: '父 阿福 手示' },
  { value: 'friend', label: '朋友', salutation: '某某仁兄台鉴', blessing: '专此奉达，顺颂时祺。', signature: '弟 阿福 手启' }
]

export function draftLetter(relationship: Relationship, content: string, senderName?: string): string {
  const rule = relationshipOptions.find((item) => item.value === relationship) ?? relationshipOptions[0]
  const signature = senderName ? rule.signature.replace('阿福', senderName) : rule.signature
  return `${rule.salutation}：\n\n敬禀者，别来时日，常怀挂念。${content}\n\n纸短情长，难尽欲言。${rule.blessing}\n\n${signature}`
}
