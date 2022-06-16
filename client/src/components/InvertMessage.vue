<template>
  <div class="container">
    <input v-model="message">

    <button v-on:click="invertMessage(message)">Invert message</button>

    <hr/>

    <p>{{ message }}</p>

  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'InvertMessage',
  data() {
    return {
      message: '',
    };
  },
  methods: {
    invertMessage(message) {
      const path = `http://inquisitors.localdomain:15000/invert/${message}`;
      axios.get(path) // Returns a thenable, i.e. a Promise
        .then((result) => {
          this.message = result.data;
        })
        .catch((error) => {
          // The linter does not like console.log()
          // eslint-disable-next-line
          console.error(error);
        });
    },
  },
};
</script>
