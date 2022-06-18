<template>
  <div class="container">
    <h1> Room: {{ roomId }} </h1>
    <form v-on:submit.prevent="submitQuestion(questionSubmission)">
      <label for="userQuestion">Question:
        <input type="text" placeholder="Submit your question..." v-model="questionSubmission"
          id="userQuestion" />
      </label>
      <input type="submit" value="Send" />
    </form>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  name: 'GameRoom',
  data() {
    return {
      socket: null,
      userName: this.$route.query.userName,
      questionSubmission: '',
      chosenQuestion: '',
      players: [],
      respondersSubset: [],
    };
  },
  props: ['roomId'],
  methods: {
    /* TODO: Listen for notification about new player in the room */

    startGame() {
      console.log('Implement me!');
    },

    submitQuestion(question) {
      this.socket.emit('qsubmit', {
        roomId: this.roomId,
        question,
      });
    },

    submitResponse() {
      /* TODO: Implement anonymous veto network */
      console.log('Implement me!');
    },

    condemnHeretic() {
      console.log('Implement me!');
    },
  },

  created() {
    this.socket = io('ws://inquisitors.localdomain:15000');
    console.log(`My name is ${this.userName}`);
    this.socket.emit('join', {
      userName: this.userName,
      roomId: this.roomId,
    });

    this.socket.on('start', (data) => {
      console.assert(data);
      /* Check if the server for the number of players */
      /* Establish secure channels with all other players */
    });

    this.socket.on('secretphase', (data) => {
      this.chosenQuestion = data.chosenQuestion;
      if (data.chosen) {
        /* If in the subset of responders - prompt user for answer */
      } else {
        /* Tell the user they have not been chosen for */
      }
    });

    this.socket.on('publicphase', (data) => {
      /* Save the subset of players that responded */
      this.respondersSubset = data.respondersSubset;
      /* TODO: Start public voting */
    });

    this.socket.on('condemned', (data) => {
      /* TODO: Handle notification about the condemned heretic */
      console.assert(data);
      /* TODO: Check if game should continue (enough players) */
    });

    this.socket.on('gameover', (data) => {
      /* TODO: Handle game over: show a button redirecting back home */
      console.assert(data);
    });
  },
};
</script>
