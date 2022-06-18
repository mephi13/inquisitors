<template>
  <div class="container">
    <label for="userName">Username:
      <input type="text" placeholder="Choose a name..." v-model="userName" id="userName" />
    </label>
  </div>
  <div class="container">
    <button @click="createRoom" class="btn btn-primary btn-lg">New room</button>
    <button @click="promptRoomId" class="btn btn-secondary btn-lg">Join room</button>
  </div>
</template>

<script>
import axios from 'axios';
import randomNames from '@/assets/randomNames.json';

export default {
  name: 'HomePage',
  data() {
    return {
      userName: '',
    };
  },
  methods: {
    createRoom() {
      /* Request a unique room ID from the server */
      const path = 'http://inquisitors.localdomain:15000/get_room';
      axios.get(path)
        .then((res) => {
          /* Navigate to the newly allocated room */
          this.$router.push({
            name: 'GameRoom',
            params: { roomId: res.data.roomId },
            query: { userName: this.userName || this.getRandomName() },
          });
        })
        .catch((err) => {
          console.error(err);
        });
    },

    promptRoomId() {
      /* Navigate to the join room prompt */
      this.$router.push({
        name: 'JoinPrompt',
        query: { userName: this.userName || this.getRandomName() },
      });
    },

    getRandomName() {
      const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const first = choose(randomNames.first);
      const last = choose(randomNames.last);
      return first + last;
    },
  },
};
</script>
