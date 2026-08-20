export type Relationship =
  | 'parents'
  | 'father'
  | 'mother'
  | 'wife'
  | 'husband'
  | 'son'
  | 'daughter'
  | 'older_brother'
  | 'younger_brother'
  | 'older_sister'
  | 'younger_sister'
  | 'grandfather'
  | 'grandmother'
  | 'uncle'
  | 'aunt'
  | 'friend'
  | 'teacher'
  | 'student'
  | 'other'

export type Tone = 'formal' | 'warm' | 'concise'
export type LetterLayout = 'horizontal' | 'vertical'
export type PaperType = 'light' | 'aged' | 'worn'

export type Scenario =
  | 'remittance'
  | 'greeting_safe'
  | 'festival'
  | 'apology'
  | 'news_update'
  | 'missing_family'
  | 'education'
  | 'birthday'
  | 'other'

export type SectionType =
  | 'salutation'
  | 'opening'
  | 'greeting'
  | 'safe_report'
  | 'remittance'
  | 'family_matters'
  | 'longing'
  | 'closing'
  | 'blessing'
  | 'signature'
  | 'date'

export interface LetterInput {
  plainSpeech: string
  recipient: string
  relationship: Relationship
  remittanceAmount?: string
  fromLocation?: string
  toLocation?: string
  additionalInfo?: string
  preferredTone?: Tone
  layout?: LetterLayout
  senderName?: string
}

export interface LetterSection {
  type: SectionType
  text: string
  order: number
}

export interface GeneratedLetter {
  id: string
  input: LetterInput
  content: string
  sections: LetterSection[]
  createdAt: string
  modelVersion: string
}

export interface TemplateSection {
  label: string
  example: string
  isVariable: boolean
  variables?: string[]
}

export interface LetterTemplate {
  id: string
  title: string
  description: string
  scenario: Scenario
  relationship: Relationship
  example: string
  structure: TemplateSection[]
  tags: string[]
  usageCount: number
  isFeatured: boolean
}

export interface ExportOptions {
  paperType: PaperType
  layout: LetterLayout
  includeEnvelope: boolean
  quality: 'standard' | 'high'
  watermark?: string
}

export interface EnvelopeData {
  recipientAddress: string
  recipientName: string
  recipientTitle: string
  senderAddress: string
  senderName: string
  remittanceAmount: string
}

export interface HonorificSet {
  salutation: string
  blessing: string
  signature: (name: string) => string
}

export interface ScenarioInfo {
  label: string
  icon: string
  description: string
}

export interface GenerateRequest {
  input: LetterInput
  model?: string
}

export interface ApiError {
  code: string
  message: string
}
