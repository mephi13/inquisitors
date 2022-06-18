import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import JoinPrompt from '@/components/JoinPrompt.vue';
import GameRoom from '@/components/GameRoom.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
