<template>
  <div class="container">
    <button type="button" v-on:click="button_click" class="btn btn-primary">{{ msg }}</button>

    <!-- v-if specifies whether an element should be added to the DOM or not. For performant
         toggling (show/hide) use v-show - if the value of v-show is falsy the element is still
         added to the DOM but display is set to none -->
    <p v-if="responseReceived">Response received</p>
    <p v-else>Response not received yet</p>

    <!-- @ is a shorthand for v-on: -->
    <button type="button" @click="isBoxVisible = !isBoxVisible">Toggle Box Visibility</button>
    <div v-if="isBoxVisible" class="box"></div>

    <hr/>

    <!-- Add an input form bound to the greeting variable. Attach an event
         listener that will be called when the user clicks enter -->
    <input @keyup.enter="greet(greeting)" v-model="greeting"> <!-- Two-way binding with greeting -->

    <button>{{greeting}}</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SimplePing',
  data() {
    return {
      msg: '',
      responseReceived: false,
      isBoxVisible: false,
      greeting: 'Hello',
    };
  },
  methods: {
    button_click() {
      this.getMessage();
    },
    getMessage() {
      const path = 'http://inquisitors.localdomain:15000/ping';
      axios.get(path)
        .then((res) => {
          this.msg = res.data;
          this.responseReceived = true;
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    greet(greeting) {
      // eslint-disable-next-line
      console.log(greeting);
    },
  },
  created() {
    this.msg = 'Ping!';
  },
};
</script>

<!-- Dot signifies class names in CSS -->
<style>
  .box {
    background-color: purple;
    height: 100px;
    width: 100px;
  }
</style>
