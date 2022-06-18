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
export default {
  name: 'HomePage',
  data() {
    return {
      roomId: '',
      errorMsg: '',
      userName: this.$route.query.userName,
    };
  },
  methods: {
    joinRoom(roomId) {
      this.$router.push({
        name: 'GameRoom',
        params: { roomId },
        query: { userName: this.userName },
      });
    },
  },
};
</script>
