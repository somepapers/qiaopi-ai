interface MediaItem {
  kind: 'article' | 'video'
  title: string
  date: string
  summary: string
  sources: { label: string; url: string }[]
}

export const mediaItems: MediaItem[] = [
  {
    kind: 'article',
    title: '寻侨迹传侨魂：闽江大学实践队走进福建省档案馆感悟侨批文化',
    date: '2026-09-02',
    summary: '团队在福建省档案馆参观侨批展览，从新加坡华侨寄回同安的家书中了解海外华侨与家乡的往来。',
    sources: [
      { label: '华人头条 · 福建频道', url: 'https://www.52hrtt.com/fj/n/w/info/G1786947890338' },
    ],
  },
  {
    kind: 'article',
    title: '探访晋江梧林侨乡遗迹 体悟侨胞赤诚爱国初心',
    date: '2026-08-13',
    summary: '团队走访晋江梧林古村落的南洋建筑与侨批展馆，通过馆藏手稿了解华侨返乡办实业的故事。',
    sources: [
      { label: '中国日报网', url: 'https://cnews.chinadaily.com.cn/a/202608/13/WS6a7d7926a310099e0fc7b988.html' },
      { label: '闽江大学官网转载', url: 'https://www.mju.edu.cn/2026/0814/c1437a223509/page.htm' },
    ],
  },
  {
    kind: 'video',
    title: '一纸侨批寄山海，青年创新传侨心',
    date: '2026-09-02',
    summary: '闽江大学国际数字经济学院“寻侨迹，传侨魂”实践队以视频回顾暑期侨批文化寻访。',
    sources: [
      { label: '华人头条 · 观看视频', url: 'https://www.52hrtt.com/global/n/w/info/F1786948122674' },
    ],
  },
]
