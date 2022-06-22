<template>
  <div class="container">
    <h1> Room: {{ roomId }} </h1>

    <div v-if="currentState.name === 'initialState'">
      <!-- TODO: Start game button if host, otherwise "Waiting for the host to start the game -->
      <button @click="startGame()" class="btn btn-primary btn-lg">Start</button>
    </div>

    <div v-else-if="currentState.name === 'waitingForQuestion'">
      <form v-on:submit.prevent="submitQuestion(currentState.questionSubmission)">
        <label for="userQuestion">Question:
          <input type="text" placeholder="Submit your question..."
            v-model="currentState.questionSubmission" id="userQuestion" />
        </label>
        <input type="submit" value="Send" />
      </form>
    </div>

    <div v-else-if="currentState.name === 'questionSubmitted'">
      <p>Question submitted!</p>
    </div>

    <div v-else-if="currentState.name === 'waitingForResponse'">
      <p>{{ this.currentState.chosenQuestion }}</p>
      <p>{{ this.currentState.responsePrompt }}</p>
      <button @click="submitResponse(true)" class="btn btn-primary btn-lg">YES</button>
      <button @click="submitResponse(false)" class="btn btn-secondary btn-lg">NO</button>
    </div>

    <div v-else-if="currentState.name === 'anonymousVetoNetwork'">
      <!-- TODO: Run veto network in the background, show sime progress bar? -->
      <p>Answer submitted. Waiting for other players...</p>
    </div>

    <div v-else-if="currentState.name === 'waitingForPublicVote'">
      <!-- TODO: Prompt for vote -->
      <div v-if="gameResult == true">
        <h2>Someone answered yes! Name the heretic!</h2>
      </div>
      <div v-else>
        <h2>No one came forward. Someone must be lying. Name them and let them burn!</h2>
      </div>

      <div v-for="player in players" :key="player">
        <div v-if="player !== userName" class="container">
          <button @click="submitVote(player)" class="btn btn-primary btn-lg">{{ player }}</button>
        </div>
      </div>
    </div>

    <div v-else-if="currentState.name === 'waitingForNextRound'">
      <button @click="nextRound" class="">Next Round</button>
    </div>

    <div v-else>
      <!-- This should never happen -->
    </div>

  </div>

  <hr />

  <p> Players: </p>
  <div v-for="player in players" :key="player" class="container">
    <div class="container">
      {{ player }}
    </div>
  </div>
  <form v-on:submit.prevent="connectToTlsServer()">
    <input type="submit" value="Handshake with Alice" />
  </form>
  <form v-on:submit.prevent="sendMesageToTlsServer(aliceMessage)">
    <label for="messageToServer">Send message to Alice/Bob:
      <input type="text" placeholder="Send Test message to peer." v-model="aliceMessage"
        id="messageAlice" />
    </label>
    <input type="submit" value="Send" />
  </form>
  <div>{{messageFrom}}:{{messageFromTlsServer}}</div>

</template>

<script>
import { io } from 'socket.io-client';
import forge from 'node-forge';
import avn from '@/services/AVN';
/* eslint-disable */
export default {
  name: 'GameRoom',
  data() {
    return {
      socket: null,
      userName: this.$route.query.userName,
      players: [],
      secretNetwork: null,
      gameResult: null,
      publicVotesAgainst: {},
      currentState: {
        name: 'initialState',
      },
    };
  },
  props: ['roomId'],
  methods: {
    stateTransition(nextState) {
      console.log(`Transitioning to state ${nextState.name}`);
      this.currentState = nextState;
    },

    startGame() {
      this.socket.emit('game_start', {
        roomId: this.roomId,
      });
    },

    submitQuestion(question) {
      this.socket.emit('question_submit', {
        roomId: this.roomId,
        question,
      });
      /* Do a state transition */
      this.stateTransition({
        name: 'questionSubmitted',
      });
    },

    async submitResponse(response) {
      if (this.currentState.mockAnswer) {
        response = false;
      }
      /* Do a state transition */
      this.stateTransition({
        name: 'anonymousVetoNetwork',
      });
      this.gameResult = avn.runProtocol(this.secretNetwork, response);

      this.socket.emit('avnet_complete', {
        roomId: this.roomId,
      });
    },

    submitVote(vote) {
      this.socket.emit('public_vote_submit', {
        roomId: this.roomId,
        vote,
      });
      /* Do a state transition */
      this.stateTransition({
        name: 'publicVoteSubmitted'
      });
    },

    nextRound() {
      this.socket.emit('next_round_ready', {
        roomId: this.roomId,
      });
    },

    sendMesageToTlsServer(message) {
      console.log('Sending message to TLS server: ', message);
      // when encrypted TLS data is received from the client, process it
      this.tlsClient.prepare(forge.util.encodeUtf8(message));
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

    this.socket.on('question_prompt', () => {
      const myName = this.userName;
      console.log('Establishing a secure network...');
      /* Game started - establish secure channels with other players */
      this.secretNetwork = avn.establishNetwork(
        this.socket,
        myName,
        this.players.filter(player => player != myName)
      );

      /* Do a state transition */
      this.stateTransition({
        name: 'waitingForQuestion',
        questionSubmission: '',
      });
    });

    this.socket.on('response_prompt', (data) => {
      const nextState = {
        name: 'waitingForResponse',
        chosenQuestion: data.question,
      };
      if (data.promptUser) {
        /* Wait for user input, then run anonymous veto network */
        nextState.responsePrompt = 'Answer the inquisitor\'s question or burn';
        nextState.mockAnswer = false;
      } else {
        /* Wait for user input, then run anonymous veto network with answer set to 0 anyway */
        nextState.responsePrompt = 'Enter an answer so that no one knows you are part of the grand inquisition';
        nextState.mockAnswer = true;
      }
      this.stateTransition(nextState);
    });

    this.socket.on('public_vote_prompt', (data) => {
      this.stateTransition({
        name: 'waitingForPublicVote',
        /* Save the list of players whose votes actually counted */
        respondersSubset: data.respondersSubset,
      });
    });

    this.socket.on('public_vote_reveal', (data) => {
      /* Find prosecutors of each player */
      for (let i = 0; i < this.players.length; i += 1) {
        const prosecutors = data.votes
          .filter((player) => player.votedFor === this.players[i])
          .map((player) => player.name);
        this.publicVotesAgainst[this.players[i]] = prosecutors;
      }

      if (data.heretic === this.userName) {
        this.stateTransition('burnedAtTheStake');
        this.$router.push({
          name: 'BurnAtTheStake',
          query: { prosecutors: this.publicVotesAgainst[this.userName] },
        });
      } else {
        /* TODO: Check if game should continue (enough players) */
        /* Do a state transition */
        this.stateTransition('waitingForNextRound');
      }
    });
  },
};
</script>
