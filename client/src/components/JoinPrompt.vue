<template>
  <div class="container-sm align-middle">
    <div class="row justify-content-center">
      <div class="col bg-dark " align="center">
        <h1> Join room </h1>
        <h1> {{ roomId }} </h1>
        <form v-on:submit.prevent="joinRoom(roomId)">
          <label class="form-label" for="roomId">Room identifier:
          <input type="text" class="form-control" placeholder="Paste room identifier..."
              v-model="roomId" id="roomId" />
          </label>
          <div class="row justify-content-center">
            <div class="col bg-dark " align="center">
            <button type="submit" class="btn btn-secondary btn-lg" >Join</button>
            </div>
          </div>
        </form>
        <div v-if="errorMsg" class="alert alert-primary" role="alert">
          <p>{{ errorMsg }}</p>
        </div>
      </div>
    </div>

    <hr />
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
