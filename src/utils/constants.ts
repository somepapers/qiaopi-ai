import type { HonorificSet, ScenarioInfo, Relationship, Scenario } from '@/types/letter'

export const HONORIFIC_MAP: Record<Relationship, HonorificSet> = {
  parents: {
    salutation: '双亲大人膝下',
    blessing: '耑此跪禀，恭请福安',
    signature: (name: string) => `男 ${name} 叩禀`,
  },
  father: {
    salutation: '父亲大人尊前',
    blessing: '耑此跪禀，恭请福安',
    signature: (name: string) => `男 ${name} 叩禀`,
  },
  mother: {
    salutation: '母亲大人膝下',
    blessing: '耑此跪禀，恭请金安',
    signature: (name: string) => `男 ${name} 叩禀`,
  },
  wife: {
    salutation: '贤妻妆次',
    blessing: '专此奉达，顺颂妆安',
    signature: (name: string) => `夫 ${name} 手启`,
  },
  husband: {
    salutation: '夫君英鉴',
    blessing: '专此奉达，顺颂时祺',
    signature: (name: string) => `妻 ${name} 敛衽`,
  },
  son: {
    salutation: '吾儿收知',
    blessing: '手此，并祝进步',
    signature: (name: string) => `父 ${name} 手示`,
  },
  daughter: {
    salutation: '女儿见字',
    blessing: '手此，顺颂闺安',
    signature: (name: string) => `父 ${name} 手示`,
  },
  older_brother: {
    salutation: '吾兄座右',
    blessing: '专此奉达，顺颂时祺',
    signature: (name: string) => `弟 ${name} 手启`,
  },
  younger_brother: {
    salutation: '贤弟如晤',
    blessing: '专此奉达，顺颂时祺',
    signature: (name: string) => `兄 ${name} 手启`,
  },
  older_sister: {
    salutation: '贤姊妆次',
    blessing: '专此奉达，顺颂时祺',
    signature: (name: string) => `妹 ${name} 手启`,
  },
  younger_sister: {
    salutation: '贤妹如晤',
    blessing: '专此奉达，顺颂时祺',
    signature: (name: string) => `姊 ${name} 手启`,
  },
  grandfather: {
    salutation: '祖父大人膝下金安',
    blessing: '耑此跪禀，恭请福安',
    signature: (name: string) => `孙 ${name} 叩禀`,
  },
  grandmother: {
    salutation: '祖母大人膝下金安',
    blessing: '耑此跪禀，恭请福安',
    signature: (name: string) => `孙女 ${name} 叩禀`,
  },
  uncle: {
    salutation: '叔父大人尊前',
    blessing: '耑此奉达，恭请福安',
    signature: (name: string) => `侄 ${name} 叩禀`,
  },
  aunt: {
    salutation: '婶母大人尊前',
    blessing: '耑此奉达，恭请福安',
    signature: (name: string) => `侄 ${name} 叩禀`,
  },
  friend: {
    salutation: '某某仁兄台鉴',
    blessing: '专此奉达，顺颂时祺',
    signature: (name: string) => `弟 ${name} 手启`,
  },
  other: {
    salutation: '某某台鉴',
    blessing: '专此奉达，顺颂时祺',
    signature: (name: string) => `${name} 谨启`,
  },
}

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  parents: '父母',
  father: '父亲',
  mother: '母亲',
  wife: '妻子',
  husband: '丈夫',
  son: '儿子',
  daughter: '女儿',
  older_brother: '兄长',
  younger_brother: '弟弟',
  older_sister: '姐姐',
  younger_sister: '妹妹',
  grandfather: '祖父',
  grandmother: '祖母',
  uncle: '叔父/伯父',
  aunt: '婶母/伯母',
  friend: '朋友',
  other: '其他',
}

export const RELATIONSHIP_GROUPS = [
  {
    label: '长辈',
    items: ['parents', 'father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt'] as Relationship[],
  },
  {
    label: '平辈',
    items: ['wife', 'husband', 'older_brother', 'younger_brother', 'older_sister', 'younger_sister', 'friend'] as Relationship[],
  },
  {
    label: '晚辈',
    items: ['son', 'daughter'] as Relationship[],
  },
]

export const SCENARIO_METADATA: Record<Scenario, ScenarioInfo> = {
  remittance: {
    label: '寄钱汇款',
    icon: '💰',
    description: '通知家人已寄出汇款，说明金额用途，叮嘱妥当安排',
  },
  greeting_safe: {
    label: '问候平安',
    icon: '🙏',
    description: '向家人报平安，问候长辈健康，表达思念之情',
  },
  festival: {
    label: '节日祝福',
    icon: '🎊',
    description: '在春节、中秋等传统节日遥寄祝福',
  },
  apology: {
    label: '道歉解释',
    icon: '📝',
    description: '解释久未寄信的原因，表达歉意',
  },
  news_update: {
    label: '告知近况',
    icon: '📮',
    description: '分享在海外的近况，让家人放心',
  },
  missing_family: {
    label: '表达思念',
    icon: '💌',
    description: '深切表达对家乡亲人的思念与牵挂',
  },
  education: {
    label: '嘱托教育',
    icon: '📚',
    description: '叮嘱子女认真读书，关心学业进展',
  },
  birthday: {
    label: '寿辰祝福',
    icon: '🎂',
    description: '为长辈寿辰遥寄祝福，表达孝心',
  },
  other: {
    label: '其他',
    icon: '✉️',
    description: '其他需要传达的家书内容',
  },
}

export const CHATBOX_CONFIG = {
  apiBaseUrl: 'https://ai.chatboxai.app/v1',
  defaultModel: 'deepseek-v3.2',
  fallbackModel: 'deepseek-chat',
  maxTokens: 4096,
  temperature: 0.5,
}
