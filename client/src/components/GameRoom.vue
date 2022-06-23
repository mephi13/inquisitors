<template>
  <div class="container">
    <h1> Room: {{ roomId }} </h1>

    <div v-if="currentState === 'initialState'">
      <!-- TODO: Start game button if host, otherwise "Waiting for the host to start the game -->
      <button @click="startGame()" class="btn btn-primary btn-lg">Start</button>
    </div>

    <div v-else-if="currentState === 'waitingForQuestion'">
      <form v-on:submit.prevent="submitQuestion(questionSubmission)">
        <label for="userQuestion">Question:
          <input type="text" placeholder="Submit your question..." v-model="questionSubmission"
            id="userQuestion" />
        </label>
        <input type="submit" value="Send" />
      </form>
    </div>

    <div v-else-if="currentState === 'questionSubmitted'">
      <p>Question submitted!</p>
    </div>

    <div v-else-if="currentState === 'waitingForResponse'">
      <p>{{ this.chosenQuestion }}</p>
      <p>{{ this.responsePrompt }}</p>
      <button @click="submitResponse(true)" class="btn btn-primary btn-lg">YES</button>
      <button @click="submitResponse(false)" class="btn btn-secondary btn-lg">NO</button>
    </div>

    <div v-else-if="currentState === 'anonymousVetoNetwork'">
      <!-- TODO: Run veto network in the background, show sime progress bar? -->
      <p>Answer submitted. Waiting for other players...</p>
    </div>

    <div v-else-if="currentState === 'waitingForPublicVote'">
      <!-- TODO: Prompt for vote -->
      <div v-if="sharedResult == true">
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

    <div v-else-if="currentState === 'waitingForNextRound'">
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
import { tlsCreateConnection } from '../services/TLS';

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
      testMessage: '',
      messageFromTlsServer: '',
      messageFrom: '',
      aliceMessage: '',
      isTlsServer: false,
      sharedResult: undefined,
      publicVotesAgainst: {},
      currentState: 'initialState',
    };
  },
  props: ['roomId'],
  methods: {
    stateTransition(nextState) {
      console.log(`Transitioning to state ${nextState}`);
      this.currentState = nextState;
    },

    resetState() {
      /* Reset back to initial state */
      this.currentState = 'initialState';
      /* TODO: Use scoping rules to reset these - associate object with each state */
      this.publicVotesAgainst = {};
      this.respondersSubset = [];
      this.questionSubmission = '';
      this.chosenQuestion = '';
      this.responsePrompt = '';
      this.sharedResult = undefined;
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
      this.stateTransition('questionSubmitted');
    },

    submitResponse(response) {
      /* Do a state transition */
      this.stateTransition('anonymousVetoNetwork');
      /* TODO: Implement anonymous veto network */
      console.assert(response);
      /* TODO: Run AVN then notify the server */
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
      this.stateTransition('publicVoteSubmitted');
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

    connectToTlsServer() {
      console.log('Connecting to TLS server...');
      // start the handshake process
      this.tlsClient.handshake();
    },

    processDataFromTlsServer(message) {
      console.log('Processing message from TLS: ', (message));
      // when encrypted TLS data is received from the server, process it
      this.messageFromTlsServer = message;
    },

    routeTlsMessage(payload, toUser) {
      const encodedPayload = (btoa(payload));
      this.socket.emit('send_tls_message', {
        roomId: this.roomId,
        payload: encodedPayload,
        receiver: toUser,
      });
    },
  },

  created() {
    this.socket = io('ws://inquisitors.localdomain:15000');
    this.socket.emit('room_join', {
      userName: this.userName,
      roomId: this.roomId,
    });

    this.socket.on('tls_message', (data) => {
      console.log('Handling tls_message');
      this.messageFrom = data.sender;
      console.log(data);
      this.tlsClient.process(atob(data.payload));
    });

    this.socket.on('tls_function', (data) => {
      console.log(data);
      this.isTlsServer = data.isServer;
      // Update TLS client for Alice
      this.tlsClient = tlsCreateConnection(
        data.isServer,
        this.processDataFromTlsServer,
        this.routeTlsMessage,
        'Bob',
      );
      console.log('We are Alice');
    });

    this.socket.on('room_update', (data) => {
      /* Update the players' list */
      this.players = data.users.map((user) => user.name);
    });

    this.socket.on('question_prompt', () => {
      /* Do a state transition */
      this.stateTransition('waitingForQuestion');
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
      /* Do a state transition */
      this.stateTransition('waitingForResponse');
    });

    this.socket.on('public_vote_prompt', (data) => {
      /* Save a list of players whose votes actually counted */
      this.respondersSubset = data.respondersSubset;
      /* Do a state transition */
      this.stateTransition('waitingForPublicVote');
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

    // create TLS client
    this.tlsClient = tlsCreateConnection(
      this.isTlsServer,
      this.processDataFromTlsServer,
      this.routeTlsMessage,
      'Alice',
    );
  },
};
</script>
