<template>
  <div class="container" align="center">
    <p>You have been burned at the stake!</p>
    <hr/>
    <p>Your prosecutors:</p>
    <div v-for="player in prosecutors" :key="player"
      class="row justify-content-center" align="center">
      <h2>{{ player }}</h2>
    </div>
  </div>
  <div class="container" align="center">
    <button @click="goHome()" class="btn btn-primary btn-lg">Home</button>
  </div>
</template>

<script>
export default {
  name: 'BurnAtTheStake',
  data() {
    return {
      userName: '',
      prosecutors: this.$route.query.prosecutors,
    };
  },
  methods: {
    goHome() {
      this.$router.push({
        name: 'HomePage',
      });
    },
  },
};
</script>
