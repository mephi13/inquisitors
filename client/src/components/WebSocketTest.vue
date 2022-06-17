<template>
  <div class="container">
    <button @click="send_json"> Introduce thyself </button>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  name: 'WebSocketChat',
  data() {
    return {
      socket: null,
    };
  },
  methods: {
    send_json() {
      this.socket.emit('json', {
        firstName: 'JSON',
        lastName: 'Derulo',
        battlecry: 'Ooo whatcha say',
      });
    },
  },
  created() {
    this.socket = io('ws://inquisitors.localdomain:15000');
    console.log(this.socket);
  },
};
</script>
