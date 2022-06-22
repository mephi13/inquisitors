import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import JoinPrompt from '@/components/JoinPrompt.vue';
import GameRoom from '@/components/GameRoom.vue';
import BurnAtTheStake from '@/components/BurnAtTheStake.vue';
import EllipticCurvePoc from '@/components/EllipticCurvePoc.vue';

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/join',
    name: 'JoinPrompt',
    component: JoinPrompt,
  },
  {
    path: '/room/:roomId',
    name: 'GameRoom',
    component: GameRoom,
    props: true,
  },
  {
    path: '/burn',
    name: 'BurnAtTheStake',
    component: BurnAtTheStake,
  },
  {
    path: '/ec',
    name: 'EllipticCurvePoc',
    component: EllipticCurvePoc,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
