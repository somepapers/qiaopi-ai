export interface Photo {
  src: string
  alt: string
  caption: string
}

export interface PracticeRecord {
  slug: string
  status: 'draft' | 'published'
  title: string
  date?: string // 有确切记录时填写 YYYY-MM-DD；不以报告日期代替活动日期
  order?: number // 同一旅程中的先后顺序
  station?: string
  city?: string
  theme?: string
  tags?: string[]
  location: string
  summary: string
  lead: string
  paragraphs: string[]
  photos: Photo[] // 没有已确认的现场照片时允许留空
}

// 配图提取自团队社会实践调研报告，practice: 前缀由 utils/practice.ts 解析为构建后的资源地址。
export const records: PracticeRecord[] = [
  {
    slug: 'fujian-archives', status: 'published', order: 1,
    station: '福建省档案馆', city: '福州', theme: '档案寻源',
    title: '从一纸侨批，读懂山海牵挂', location: '福建省档案馆',
    summary: '近距离观摩侨批档案，在字迹与汇兑印章间，读懂“银信合一”背后的亲情与家国情怀。',
    lead: '我们的寻侨之旅，从福建省档案馆启程。一封封泛黄的侨批，将百年前海外游子的生活与牵挂带到眼前。',
    paragraphs: [
      '近距离观摩侨批档案原件，辨读批笺上的字迹与汇兑印章，我们逐渐理解“银信合一”的含义：寄回家中的，既有维系生计的钱款，也有远行亲人的牵挂。纸上的称谓、嘱托与落款，让海外华侨的奋斗经历变得具体可感。',
      '通过与福建省档案馆编研开发处郑宗伟处长交流，队员们进一步了解侨批的收藏与研究，并探讨侨批文化宣传推广的创新路径。这一站，为后续的侨乡走访与人物访谈建立了历史线索。',
    ],
    tags: ['档案原件', '银信合一', '家国情怀'],
    photos: [
      { src: 'practice:archives-team.webp', alt: '实践队成员在福建省档案馆展厅内手持队旗合影', caption: '寻侨之旅的起点：实践队在福建省档案馆合影。' },
      { src: 'practice:archives-talk.webp', alt: '实践队成员围坐桌旁与馆方人员交流', caption: '与福建省档案馆编研开发处郑宗伟处长交流侨批文化的研究与传播。' },
    ],
  },
  {
    slug: 'quanzhou-wulin', status: 'published', order: 2,
    station: '梧林传统村落及侨批馆', city: '泉州', theme: '侨乡寻迹',
    title: '走进古厝，寻找侨乡记忆', location: '泉州梧林传统村落及侨批馆',
    summary: '穿行红砖古厝与番仔楼，走进侨批馆，寻找华侨远渡重洋、心系桑梓的历史印记。',
    lead: '走进梧林，红砖古厝与中西合璧的番仔楼映入眼帘。我们沿着村落的街巷，寻找侨批之外的另一种乡愁表达。',
    paragraphs: [
      '团队穿行村落、参观侨批馆，将建筑中的华侨印记与展陈中的书信故事相互对照，认识海外华侨远渡重洋、心系桑梓的人生历程。中西合璧的建筑，也留下了海外生活与故乡文化交汇的痕迹。',
      '从一封家书到一座故居，原本停留在纸上的乡愁有了可感可见的模样。一砖一瓦间的历史，让我们更加理解“归乡”的分量，也为后续文创设计积累了侨乡文化素材。',
    ],
    tags: ['古厝寻迹', '侨批展陈', '桑梓深情'],
    photos: [{ src: 'practice:wulin.webp', alt: '身穿蓝色队服的实践队成员在梧林侨批馆观看墙面展陈', caption: '实践队参观梧林古村落侨批馆，在展陈中寻找华侨与故乡的联系。' }],
  },
  {
    slug: 'quanzhou-letter-writer', status: 'published', order: 3,
    station: '侨批代书人访谈', city: '泉州', theme: '听见侨声',
    title: '听代书人讲述，一封侨批如何写成', location: '泉州 · 访谈姜明典老先生',
    summary: '聆听姜明典老先生讲述代书往事，从称谓、行文到落款，记录一门替人传情的手艺。',
    lead: '离开梧林后，我们继续在泉州寻访侨批代书人。姜明典老先生的讲述与示范，让纸上的历史有了声音。',
    paragraphs: [
      '从称谓礼仪、行文格式到遣词造句，老先生现场演示代书侨批的过程。队员们围坐聆听、记录细节，认识到代书不仅需要熟悉书写规范，更要替寄信人妥帖表达思念与嘱托。',
      '这次访谈成为后续数字创作的重要起点。老先生的指导与示范为“侨批代书”程序设计提供参考；他讲述的一则华侨救父故事，也成为剧情游戏的创作素材，让真实记忆以新的形式继续被讲述。',
    ],
    tags: ['口述历史', '代书示范', '创作溯源'],
    photos: [
      { src: 'practice:letter-writer.webp', alt: '队员手持录音设备采访坐在桌旁的姜明典老先生', caption: '采访侨批代书人姜明典老先生，记录代书往事与侨批故事。' },
      { src: 'practice:letter-writer-demo.webp', alt: '姜明典老先生在桌前示范书写，队员在旁观看记录', caption: '从称谓到行文，近距离学习传统侨批的书写规范。' },
      { src: 'practice:letter-writer-team.webp', alt: '实践队与姜明典老先生在门前合影', caption: '实践队与姜明典老先生合影。' },
    ],
  },
  {
    slug: 'zhangzhou-qiaopi', status: 'published', order: 4,
    station: '漳州古城侨批馆', city: '漳州', theme: '古城读批',
    title: '在古城烟火中，感受侨批温度', location: '漳州古城侨批馆',
    summary: '在古城中的侨批展陈里，理解书信承载的亲情、诚信与责任，思考传统文化如何走近青年。',
    lead: '沿着侨批的线索，我们来到漳州古城侨批馆。侨批文化与古城生活相融，让历史在街巷间可感可及。',
    paragraphs: [
      '通过参观展陈、了解侨批故事，队员们进一步认识侨批承载的亲情、诚信与责任，也关注到侨批文化展示与古城活化利用之间的联系。',
      '此次走访让我们思考：如何让观众愿意停下来读一封侨批，又如何让年轻人在参观之后继续了解它？这些问题成为后续互动作品设计的出发点，引导我们将调研所得转化为可参与的文化体验。',
    ],
    tags: ['展馆研学', '古城文化', '传播思考'], photos: [],
  },
  {
    slug: 'yunxiao-collectors', status: 'published', order: 5,
    station: '云霄县收藏家协会', city: '云霄', theme: '民间守忆',
    title: '触摸历史原件，认识民间守护者', location: '云霄县收藏家协会 · 闽南茶道博物馆',
    summary: '与龚楠主席研读侨批实物，了解民间收藏与保护，并通过实践基地共建延续这份联系。',
    lead: '在云霄，我们走进县收藏家协会、闽南茶道博物馆，认识那些让侨批记忆得以留存的民间守护者。',
    paragraphs: [
      '龚楠主席向团队展示多年珍藏的侨批实物，并分享收藏与研究心得。队员们近距离观察、研读原件，在交流中了解侨批从民间书信到世界记忆遗产的历程。',
      '一件件被妥善留存的原件，让我们认识到民间力量在侨批保护中的作用。团队与闽南茶道博物馆（云霄收藏家协会）签署社会实践基地协议，为持续开展调研、史料整理、数字化转化与志愿服务建立合作基础。',
    ],
    tags: ['民间收藏', '实物研读', '基地共建'],
    photos: [
      { src: 'practice:yunxiao.webp', alt: '实践队成员俯身观察桌上展开的侨批历史原件', caption: '在云霄县收藏家协会近距离研读侨批原件。' },
      { src: 'practice:yunxiao-talk.webp', alt: '队员围坐茶桌，与龚楠主席交流并记录', caption: '与龚楠主席交流侨批收藏、研究及文化传承。' },
    ],
  },
  {
    slug: 'fuzhou-digital-creation', status: 'published', order: 6,
    station: '返回福州 · 成果创作', city: '福州', theme: '让侨批新生',
    title: '把沿途故事，写进数字作品', location: '福州 · 实践成果创作',
    summary: '将走访与访谈所得转化为剧情游戏、AI 代书程序、宣传视频和“侨燕”文创，让侨批故事继续传递。',
    lead: '带着访谈记录与调研素材返回福州，我们整理故事、打磨脚本、设计互动，让沿途遇见的人与事成为创作的起点。',
    paragraphs: [
      '团队开发侨批剧情游戏《侨批·海那边是家》，以1947年的闽南侨乡与南洋为故事背景，将访谈素材融入人物命运，通过剧情选择与解谜互动，带领玩家了解侨批的传递过程。',
      '“侨批代书”程序结合传统代书规范，提供用语润色与书写建议，并融入寄送流程体验，让用户尝试写下一封数字侨批。线上问卷反馈与代书人的示范，为功能设计提供了参考。',
      '队员们整理走访影像与访谈片段，制作社会实践宣传视频，以青年视角分享侨乡见闻。同时打造“侨燕”IP及系列文创，将燕尾脊、红砖古厝与信封邮戳等元素融入设计，让侨批文化走进日常生活。',
    ],
    tags: ['剧情游戏', 'AI 代书', '影像记录', '侨燕文创'],
    photos: [
      { src: 'practice:game.webp', alt: '《侨批·海那边是家》剧情游戏的夜色古厝场景画面', caption: '团队研发的《侨批·海那边是家》剧情游戏画面。' },
      { src: 'practice:game-story.webp', alt: '侨批剧情游戏中人物在侨乡相遇的对话场景', caption: '将访谈故事融入剧情，让玩家在人物经历中理解侨批文化。' },
      { src: 'practice:ai-writer.webp', alt: '侨批 AI 代书人程序的手机端书信展示界面', caption: '“侨批代书”程序：用数字家书延续跨越山海的牵挂。' },
      { src: 'practice:film.webp', alt: '社会实践宣传视频中的寻侨迹传侨魂主题画面', caption: '整理走访与访谈影像，制作社会实践宣传视频。' },
      { src: 'practice:qiaoyan.webp', alt: '印有侨燕角色图案的粉色与米白色帆布袋设计', caption: '“侨燕”IP系列文创设计，让侨批文化走进日常。' },
    ],
  },
]
