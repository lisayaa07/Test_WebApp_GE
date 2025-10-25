import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import MatchCaseView from '@/views/MatchCaseView.vue'
import ReviewView from '@/views/ReviewView.vue'
import ShowResultsView from '@/views/ShowResultsView.vue'
import AllSubjectsView from '@/views/AllSubjectsView.vue'
import ReviewSubjectsView from '@/views/ReviewSubjectsView.vue'
import PopularSubjectsView from '@/views/PopularSubjectsView.vue'
import Login from '@/views/Login.vue'
import SignupView from '@/views/Signup.vue'
import FavoritesView from '@/views/FavoritesView.vue'

import test from '@/layout/test.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/matchcase',
      name: 'matchcase',
      component: MatchCaseView,
      meta: { requiresAuth: true }
    },
    {
      path: '/review',
      name: 'review',
      component: ReviewView,
      meta: { requiresAuth: true }
    },
    {
      path: '/showresults',
      name: 'showresults',
      component: ShowResultsView,
    },
    {
      path: '/allsubjects',
      name: 'allsubjects',
      component: AllSubjectsView,
    },
    {
      path: '/subjects/:id/reviews',
      name: 'reviewsubjects',
      component: ReviewSubjectsView,
    },
    {
      path: '/popularsubjects',
      name: 'popularsubjects',
      component: PopularSubjectsView,
    },
    { path: '/login', 
      name: 'login', 
      component: Login 
    },
    { path: '/signup', 
      name: 'signup', 
      component: SignupView 
    },
    { path: '/Login.vue', 
      redirect: '/login' 
    },
    { path: '/Login', 
      redirect: '/login' 
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/test', 
      name: 'test', 
      component: test 
    }
  

  ],
})


const API_URL = import.meta.env.VITE_API_URL || 'https://test-webapp-ge.onrender.com'

// แคชสถานะสั้น ๆ เพื่อไม่ให้เรียก /me รัว ๆ ระหว่างนำทาง
let __authCache = { at: 0, ok: false }

async function checkAuth() {
  const now = Date.now()
  if (now - __authCache.at < 3000) { // แคช 3 วินาที
    return __authCache.ok
  }
  try {
    const res = await fetch(`${API_URL}/me`, {
      method: 'GET',
      credentials: 'include', // สำคัญมาก เพื่อส่งคุกกี้ไป-กลับ
    })
    const data = await res.json()
    __authCache = { at: now, ok: !!data?.ok }
    return !!data?.ok
  } catch {
    __authCache = { at: now, ok: false }
    return false
  }
}

router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAuth) return next()
  const ok = await checkAuth()
  if (!ok) return next({ name: 'login' })
  next()
})


export default router
