import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MatchCaseView from '@/views/MatchCaseView.vue'
import ReviewView from '@/views/ReviewView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/matchcase',
      name: 'matchcase',
      component: MatchCaseView,
    },
    {
      path: '/review',
      name: 'review',
      component: ReviewView,
    },
  ],
})

export default router
