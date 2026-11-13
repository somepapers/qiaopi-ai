<script setup lang="ts">
</script>

<template>
  <div class="max-w-3xl mx-auto py-12">
    <div class="vintage-paper rounded-xl p-6 md:p-10 text-center space-y-6">
      <div class="text-6xl">📮</div>
      <h1 class="text-2xl md:text-3xl font-serif font-bold text-ink">关于“寻侨迹，传侨魂”</h1>

      <div class="w-16 h-px bg-red-seal/30 mx-auto"></div>

      <div class="text-left space-y-5 font-serif text-ink/70 leading-loose text-base">
        <p>
          “寻侨迹，传侨魂”是我们在闽江大学开展的社会实践项目。在这里，你可以走进展览馆，放大一件侨批，细看纸上的字迹。
          <RouterLink to="/write" class="text-red-seal underline underline-offset-4">侨批 AI 代书人</RouterLink>是项目的写信功能。写下想对家人说的话，便可生成一封侨批格式的家书。
        </p>
        <p>
          <strong class="text-ink">侨批</strong>（又称"银信"），是海外华侨通过民间机构寄回国内、
          附带家书或简单附言的汇款凭证，盛行于1820年代至1970年代。
          2013年6月，"侨批档案"正式入选联合国教科文组织《世界记忆名录》。
        </p>
        <p>
          侨批承载着海外华侨"家书抵万金"的深厚情感，体现了中华民族的孝道伦理、
          亲情纽带和诚信精神。习近平总书记曾指出，侨批"记载了老一辈海外侨胞艰难的创业史和浓厚的家国情怀"。
        </p>
      </div>

      <div class="w-16 h-px bg-red-seal/30 mx-auto"></div>

      <div class="flex justify-center gap-4">
        <div class="vintage-paper rounded-lg px-6 py-3 text-center">
          <div class="text-2xl mb-1">🏛️</div>
          <p class="text-xs font-serif text-ink/50">联合国教科文组织</p>
          <p class="text-xs font-serif text-ink/40">世界记忆遗产</p>
        </div>
        <div class="vintage-paper rounded-lg px-6 py-3 text-center">
          <div class="text-2xl mb-1">🤖</div>
          <p class="text-xs font-serif text-ink/50">AI驱动</p>
          <p class="text-xs font-serif text-ink/40">Chatbox AI</p>
        </div>
        <div class="vintage-paper rounded-lg px-6 py-3 text-center">
          <div class="text-2xl mb-1">📖</div>
          <p class="text-xs font-serif text-ink/50">文化传承</p>
          <p class="text-xs font-serif text-ink/40">非盈利公益</p>
        </div>
      </div>

      <p class="text-sm text-ink/60 font-serif font-semibold">
        作者：闽江大学“寻侨迹，传侨魂”社会实践团队
      </p>

      <p class="text-sm text-ink/50 font-serif">
        致谢：福建省档案馆、云霄县收藏家协会
      </p>

      <p class="text-xs text-ink/30 font-serif">
        本项目为公益性质，致力于侨批文化的数字化传承与普及。
      </p>

      <div class="w-16 h-px bg-red-seal/30 mx-auto"></div>

      <!-- 联系方式 -->
      <div class="space-y-2">
        <p class="text-sm text-ink/70 font-serif font-semibold">📧 联系我们</p>
        <p class="text-sm text-ink/60 font-serif">
          团队邮箱：<a href="mailto:qiaopi_ai@qq.com" class="text-red-seal/80 hover:text-red-seal underline underline-offset-2 transition-colors">qiaopi_ai@qq.com</a>
        </p>
      </div>

      <!-- 版权声明 -->
      <div class="vintage-paper rounded-lg px-4 py-3 text-left">
        <p class="text-xs text-ink/50 font-serif leading-relaxed">
          ⚠️ <strong class="text-ink/70">声明：</strong>本站全部内容仅限非商业公益使用，禁止任何形式的商业利用。站内侨批范文、AI生成内容等知识产权归本团队所有，未经书面授权不得转载、镜像或用于商业目的。侵权必究。
        </p>
      </div>
    </div>
  </div>
</template>
