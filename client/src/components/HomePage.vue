<template>
  <div class="container-sm align-middle">
    <div class="row justify-content-center">
        <div class="col bg-dark " align="center">
          <h1>
            Welcome to Inquisitors! Hope you'll have a good time here :)
          </h1>
          <label class="form-label" for="userName">Username:
            <input class="form-control" type="text"
              placeholder="Choose a name..." v-model="userName" id="userName"
            />
          </label>
          <div v-if="userName === ''" class="alert alert-info" role="alert">
            <p>If you don't provide a username, you'll get a random one: {{ randomName }}</p>
            <button @click="getRandomName" type="button"
              :class="'btn btn-info'">
              Reroll username
            </button>
          </div>
        </div>
    </div>
    <div class="row justify-content-center" align="center">
      <div class="col-4">
          <button @click="createRoom" type="button"
            :class="'btn btn-primary btn-lg'">
            New room
          </button>
      </div>
      <div class="col-4" align="center">
          <button @click="promptRoomId" type="button"
            :class="'btn btn-secondary btn-lg'">
            Join room
          </button>
      </div>
    </div>
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
      randomName: '',
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
            query: { userName: this.userName || this.randomName },
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
        query: { userName: this.userName || this.randomName },
      });
    },

    getRandomName() {
      const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const first = choose(randomNames.first);
      const last = choose(randomNames.last);
      this.randomName = first + last;
    },
  },
  created() {
    this.getRandomName();
  },
};
</script>
