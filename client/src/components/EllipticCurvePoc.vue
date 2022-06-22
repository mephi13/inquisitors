<template>
  <div class="container">
    <p>EC POC</p>
  </div>
  <div class="container">
    <button @click="goHome()" class="btn btn-primary btn-lg">Home</button>
  </div>
</template>

<script>
import sha256 from 'crypto-js/sha256';

const EC = require('elliptic').ec;
/* eslint-disable */
/* Create and initialize EC context */
const ec = new EC('secp256k1');

async function getChallenge(publicEphemeral) {
  /* Get Schnorr challenge, i.e. hash over ephemeral */
  const encoding = publicEphemeral.encode('hex');
  const hash = sha256('sha256', encoding);
  console.log(`HASHED TO ${hash}`);
  const temp = ec.genKeyPair();
  return temp.getPrivate();
}

function getZeroKnowledgeProof(secretExponent, publicKey) {
  /* */
  const ephemeral = ec.genKeyPair();

  const X = ephemeral.getPublic();
  const x = ephemeral.getPrivate();

  const c = getChallenge(X);
  const s = x.add(secretExponent.mul(c));


  const testLhs = ec.keyFromPrivate(s).getPublic();
  const testRhs = publicKey.mul(c).add(X);

  const equalEc = (P, Q) => {

    return P.getX().eq(Q.getX()) && P.getY().eq(Q.getY());
  }
  if (equalEc(testLhs, testRhs)) {

    console.log("SCHNORR VERIFICATION SUCCESSFUL");

  } else {

    console.log(testLhs);
    console.log(testRhs);
    console.log("SCHNORR VERIFICATION FAILED");
  }

  return {};
}

function getCommitment() {
  /* TODO: Produce a commitment value and a non-interactive ZKP */
  const key = ec.genKeyPair();

  console.log(`getCommitment(): ${key}`);

  const secret = key.getPrivate();

  return {
    ephemeral: key.getPublic().encode('hex'),
    proof: getZeroKnowledgeProof(secret, key.getPublic()),
  };
}

function verifyProof(publicValue, proof) {
  /* TODO: Verify proof of knowledge of the secret exponent */
  return true;
}

function getResultShare(myName, bit, othersCommitments) {

  /* Assume commitments format to be { name, ephemeral, proof } */
  const share = othersCommitments.reduce((acc, curr) => {

  }, 0);
}

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

    getCommitment();
  }
};
</script>
