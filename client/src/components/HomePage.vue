<template>
  <div class="container">
    <button @click="createRoom" class="btn btn-primary btn-lg">New room</button>
    <button @click="promptRoomId" class="btn btn-secondary btn-lg">Join room</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HomePage',
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
      });
    },
  },
};
</script>
