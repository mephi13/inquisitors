<template>
  <div class="container">
    <h1> Room: {{ roomId }} </h1>
    <form v-on:submit.prevent="submitQuestion(question)">
      <label for="userQuestion">Question:
        <input type="text" placeholder="Submit your question..." v-model="question"
          id="userQuestion" />
      </label>
      <input type="submit" value="Send" />
    </form>

      <hr />

      <button v-on:click="getPlayers">Get players</button>

      <div>
        <li v-for="player in players" :key="player">
          {{ player }}
        </li>
      </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';
import axios from 'axios';

export default {
  name: 'GameRoom',
  data() {
    return {
      question: '',
      roomId: this.$route.params.roomId,
      socket: null,
      players: [],
    };
  },
  methods: {
    /* TODO: Listen for notification about new player in the room */

    startGame() {
      console.log('Implement me!');
    },

    /* TODO: Establish secure channel with each player */

    submitQuestion() {
      this.socket.emit('submitQuestion', {
        roomId: this.roomId,
        question: this.question,
      });
    },

    getPlayers() {
      /* TODO: This method will likely be removed and players' list will
       * be received asynchronously when the game starts */
      const path = `http://inquisitors.localdomain:15000/get_players/${this.roomId}`;
      axios.get(path)
        .then((res) => {
          this.players = res.data.players;
        })
        .catch((err) => {
          console.error(err);
        });
    },

    /* TODO: Listen for notification about the chosen question and
     * inclusion in the responders' subset */

    submitResponse() {
      /* TODO: Implement anonymous veto network */
      console.log('Implement me!');
    },

    /* TODO: Listen for subset announcement and public voting phase start */

    condemnHeretic() {
      console.log('Implement me!');
    },

    /* TODO: Listen for notification about the condemned heretic */

    /* TODO: Rinse and repeat */
  },
  created() {
    this.socket = io('ws://inquisitors.localdomain:15000');
    this.socket.emit('joinRoom', this.roomId);
  },
};
</script>
