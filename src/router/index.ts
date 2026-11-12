import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/practice',
      name: 'practice',
      component: () => import('@/views/PracticeView.vue'),
    },
    {
      path: '/practice/:slug',
      name: 'practice-detail',
      component: () => import('@/views/PracticeDetailView.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/write',
      name: 'write',
      component: () => import('@/views/GenerateView.vue'),
    },
    {
      path: '/templates',
      name: 'templates',
      component: () => import('@/views/TemplatesView.vue'),
    },
    {
      path: '/templates/:id',
      name: 'template-detail',
      component: () => import('@/views/TemplateDetailView.vue'),
    },
    {
      path: '/culture',
      name: 'culture',
      component: () => import('@/views/CultureView.vue'),
    },
    {
      path: '/exhibition',
      name: 'exhibition',
      component: () => import('@/views/ExhibitionView.vue'),
    },
    {
      path: '/exhibition/admin',
      name: 'exhibition-admin',
      component: () => import('@/views/ExhibitionAdmin.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/l',
      name: 'letter-receive',
      component: () => import('@/views/LetterReceive.vue'),
    },
  ],
  scrollBehavior(to, from) {
    // 同路径仅查询参数变化（如展览馆 Tab 切换）时保持滚动位置，避免强制滚回页顶
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

export default router
