<template>
  <div class="container">
    <p>You have been burned at the stake!</p>
    <hr/>
    <p>Your prosecutors:</p>
    <div v-for="player in prosecutors" :key="player">
      <p>{{ player }}</p>
    </div>
  </div>
  <div class="container">
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
