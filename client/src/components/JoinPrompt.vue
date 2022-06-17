<template>
  <div class="container">
    <h1> Room: {{ roomId }} </h1>
    <form v-on:submit.prevent="joinRoom(roomId)">
      <label for="roomId">Room identifier:
        <input type="text" placeholder="Paste room identifier..." v-model="roomId"
          id="roomId" />
      </label>
      <input type="submit" value="Join" />

      <hr />
      <p v-if="errorMsg">{{ errorMsg }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HomePage',
  data() {
    return {
      roomId: '',
      errorMsg: '',
    };
  },
  methods: {
    joinRoom(roomId) {
      /* First check with the server that the room exists */
      const path = `http://inquisitors.localdomain:15000/check_room/${roomId}`;
      axios.get(path)
        .then((response) => {
          console.assert(response.data.success);
          this.errorMsg = '';
          /* Room exists, navigate to it */
          this.$router.push({
            name: 'GameRoom',
            params: { roomId },
          });
        })
        .catch(() => {
          this.errorMsg = `No room found with ID: ${roomId}`;
        });
    },
  },
};
</script>
