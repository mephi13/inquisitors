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
  <hr />
  <p> Players: </p>
  <div v-for="player in players" :key="player" class="container">
    <div class="container">
      {{ player }}
    </div>
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
      players: [],
      questionSubmission: '',
      chosenQuestion: '',
      responsePrompt: '',
      respondersSubset: [],
    };
  },
  props: ['roomId'],
  methods: {
    /* TODO: Listen for notification about new player in the room */

    startGame() {
      console.log('Implement me!');

      this.socket.emit('game_start', {
        roomid: this.roomId,
      });
    },

    submitQuestion(question) {
      this.socket.emit('question_submit', {
        roomId: this.roomId,
        question,
      });
    },

    submitResponse(response) {
      /* TODO: Implement anonymous veto network */
      console.log('Implement me!');
      console.assert(response);
      /* TODO: Run AVN then notify the server */
      this.socket.emit('avnet_complete', {
        roomId: this.roomId,
      });
    },

    submitVote(vote) {
      console.log('Implement me!');
      this.socket.emit('public_vote_submit', {
        roomId: this.roomId,
        vote,
      });
    },
  },

  created() {
    this.socket = io('ws://inquisitors.localdomain:15000');
    this.socket.emit('room_join', {
      userName: this.userName,
      roomId: this.roomId,
    });

    this.socket.on('room_update', (data) => {
      /* Update the players' list */
      this.players = data.users.map((user) => user.name);
    });

    this.socket.on('response_prompt', (data) => {
      this.chosenQuestion = data.question;
      if (data.promptUser) {
        /* TODO: Wait for user input, then run anonymous veto network */
        this.responsePrompt = 'Answer the inquisitor\'s question or burn';
      } else {
        /* TODO: Wait for user input, then run anonymous veto network with answer set to 0 */
        this.responsePrompt = 'Enter an answer so that no one knows you are part of the grand inquisition';
      }
    });

    this.socket.on('public_vote_prompt', (data) => {
      /* Save a list of players whose votes actually counted */
      this.respondersSubset = data.respondersSubset;
      /* TODO: Prompt the user to name a heretic */
    });

    this.socket.on('public_vote_reveal', (data) => {
      /* TODO: Handle notification about the condemned heretic */
      console.assert(data.results);
      console.assert(data.heretic);
      /* TODO: Check if game should continue (enough players) */
    });
  },
};
</script>
