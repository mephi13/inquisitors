<template>
  <div class="container">
    <p>EC POC</p>
  </div>
  <div class="container">
    <button @click="goHome()" class="btn btn-primary btn-lg">Home</button>
  </div>
</template>

<script>
import av from '@/libs/avnet_core';

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
  created() {
    /* eslint-disable */
    const eph1 = av.getEphemeralCommitmentWithProof();
    const eph2 = av.getEphemeralCommitmentWithProof();
    const eph3 = av.getEphemeralCommitmentWithProof();
    /* TODO: In production environment remember to strip the secrets from the ephemerals above */
    const commits = [eph1, eph2, eph3];
    const tempShare1 = av.getSecretShareIfProofsValid(commits, 0);
    const tempShare2 = av.getSecretShareIfProofsValid(commits, 1);
    const tempShare3 = av.getSecretShareIfProofsValid(commits, 2);

    const finalShare1 = av.commitToVeto(false, eph1.secret, tempShare1);
    const finalShare2 = av.commitToVeto(true, eph2.secret, tempShare2);
    const finalShare3 = av.commitToVeto(false, eph3.secret, tempShare3);

    const result = av.getFinalResultIfProofsValid([finalShare1, finalShare2, finalShare3]);
    console.log(result);
  },
};
</script>
