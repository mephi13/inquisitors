<template>
  <div class="container">
    <p>EC POC</p>
  </div>
  <div class="container">
    <button @click="goHome()" class="btn btn-primary btn-lg">Home</button>
  </div>
</template>

<script>
import zkp from '@/libs/zkp';

const BN = require('bn.js');

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
    const { commitment, proof } = zkp.getRandomCommitmentAndProof();
    const newBase = commitment.mul(new BN(12));
    const secretExponent = new BN(5);
    const publicCommit = newBase.mul(secretExponent);
    const newProof = zkp.getZeroKnowledgeProof(secretExponent, newBase);

    if (zkp.verifyZeroKnowledgeProof(newProof, publicCommit, newBase)) {
      console.log('VERIFICATION OK');
    } else {
      console.log('VERIFICATION FAILED');
    }
  },
};
</script>
