import { createRouter, createWebHistory } from 'vue-router';
import SimplePing from '../components/SimplePing.vue';
/* No braces indicates import default and assign a local name to it (local to this file) */
import InvertMessage from '../components/InvertMessage.vue';

const routes = [
  {
    path: '/invert',
    name: 'root',
    component: InvertMessage,
  },
  {
    path: '/ping',
    name: 'ping',
    component: SimplePing,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
