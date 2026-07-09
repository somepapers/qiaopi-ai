import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
