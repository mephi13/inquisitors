<template>
  <div class="container-sm align-middle">
    <div class="row justify-content-center" align ="center">
      <h1 class="text-primary"> Inquisitors </h1>
      <h6 class="text-info">Room: {{ roomId }}</h6>

      <div v-if="errorMsg" class="alert alert-primary" role="alert">
        <p>{{ errorMsg }}</p>
      </div>

      <div v-if="currentState.name === 'initialState'">
        <!-- TODO: Start game button if host, otherwise "Waiting for the host to start the game -->
        <div class="row justify-content-center" align = "center">
        <div class="col bg-dark" align="">
          <button @click="startGame()" class="btn btn-primary btn-lg">Start game</button>
        </div>
        </div>
      </div>

      <div v-else-if="currentState.name === 'waitingForQuestion'">
        <div class="row justify-content-center">
          <form v-on:submit.prevent="submitQuestion(currentState.questionSubmission)">
            <div class="col" align="center">
              <label class="form-label" for="userQuestion">Question:
                <textarea class="form-control" placeholder="Submit your question..."
                  v-model="currentState.questionSubmission" id="userQuestion" rows="3"/>
              </label>
            </div>
            <div class="col" align="center">
              <button type="submit" class="btn btn-primary btn-lg" >Submit</button>
            </div>
          </form>
        </div>
      </div>

      <div v-else-if="currentState.name === 'questionSubmitted'">
        <div class="row justify-content-center" align="center">
          <p>Question submitted!</p>
          <p class="text-primary">Waiting for other players...</p>
        </div>
      </div>

      <div v-else-if="currentState.name === 'waitingForResponse'">
        <div class="row justify-content-center" align="center">
          <div class="col" align="center">
            <p>{{ this.currentState.chosenQuestion }}</p>
            <p>{{ this.currentState.responsePrompt }}</p>
            <button @click="submitResponse(true)" class="btn btn-primary btn-lg btn-block">
              YES
            </button>
            <button @click="submitResponse(false)" class="btn btn-secondary btn-lg btn-block">
              NO
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="currentState.name === 'anonymousVetoNetwork'">
        <div class="row justify-content-center" align="center">
          <!-- TODO: Run veto network in the background, show sime progress bar? -->
          <p>Answer submitted. Waiting for other players...</p>
        </div>
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
          <div v-if="player.name !== userName" class="row justify-content-center" align="center">
            <button @click="submitVote(player.name)"
              class="btn btn-primary btn-lg">{{ player.name }}</button>
          </div>
        </div>
      </div>

      <div v-else-if="currentState.name === 'waitingForNextRound'">
        <div class="row justify-content-center" align="center">
          <button @click="nextRound" class="btn btn-primary btn-lg">Next Round</button>
        </div>
      </div>

      <div v-else>
        <!-- This should never happen -->
      </div>

    </div>

    <hr />

    <h3 class="text-primary"> Players: </h3>
    <div v-for="player in players" :key="player.index" class="container">
      <div class="container">
        {{ player.name }}
      </div>
    </div>

    <hr />

    <button @click="copyRoomId" class="btn btn-info outline">Copy room id</button>
  </div>
</template>

<script>
import { io } from 'socket.io-client';
import avnet from '@/libs/avnet-msgs';

export default {
  name: 'GameRoom',
  data() {
    return {
      socket: null,
      userName: this.$route.query.userName,
      players: [],
      secureNetwork: null,
      gameResult: null,
      publicVotesAgainst: {},
      currentState: {
        name: 'initialState',
      },
      errorMsg: '',
    };
  },
  props: ['roomId'],
  methods: {
    copyRoomId() {
      navigator.clipboard.writeText(this.roomId);
    },

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
      const { mockAnswer } = this.currentState;
      /* Do a state transition */
      this.stateTransition({
        name: 'anonymousVetoNetwork',
      });

      /* Run anonymous veto network */
      this.gameResult = await avnet.runAnonymousVeto(
        this.secureNetwork,
        mockAnswer ? false : response,
      );

      /* Do a state transition */
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
        name: 'publicVoteSubmitted',
      });
    },

    nextRound() {
      /* For now for demonstration purposes just return home */
      this.$router.push({
        name: 'HomePage',
      });
      /* TODO: Reset the socket, i.e. remove one-time event listeners */
      // this.socket.emit('next_round_ready', {
      //   roomId: this.roomId,
      // });
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
      this.players = data.users;
    });

    this.socket.on('question_prompt', () => {
      console.log('Establishing a secure network...');
      /* Game started - establish secure channels with other players */
      this.secureNetwork = avnet.establishSecureNetwork({
        socket: this.socket,
        roomId: this.roomId,
        players: this.players,
        ownName: this.userName,
      });

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
          .filter((player) => player.votedFor === this.players[i].name)
          .map((player) => player.name);
        this.publicVotesAgainst[this.players[i].name] = prosecutors;
      }

      if (data.heretic === this.userName) {
        this.stateTransition({
          name: 'burnedAtTheStake',
        });
        this.$router.push({
          name: 'BurnAtTheStake',
          query: { prosecutors: this.publicVotesAgainst[this.userName] },
        });
      } else {
        /* TODO: Check if game should continue (enough players) */
        /* Do a state transition */
        this.stateTransition({
          name: 'waitingForNextRound',
        });
      }
    });
  },
};
</script>
