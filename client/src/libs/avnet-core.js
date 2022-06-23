/* Implement the mathematics behind the anonymous veto network */

import zkp from '@/libs/zkp';

/**
 * @brief Get random commitment and produce a ZKP for it
 * @return Random commitment and a corresponding zero-knowledge proof
 */
function getEphemeralCommitmentWithProof() {
  return zkp.getRandomCommitmentAndProof();
}

/**
 * @param {boolean} veto Boolean vote
 * @param {number} secretExponent Secret exponent corresponding to the public commitment
 * @param {curve.base.BasePoint} secretShare Share of the secret
 * @return Final secret share and a corresponding zero-knowledge proof
 */
function commitToVeto(veto, secretExponent, secretShare) {
  /* Use random exponent to veto the network, otherwise set to the previously used secret */
  const exponent = veto ? zkp.getRandomCommitmentAndProof().secret : secretExponent;

  /* Use the secret share as base point */
  const proof = zkp.getZeroKnowledgeProof(exponent, secretShare);

  return {
    commitment: secretShare.mul(exponent),
    basePoint: secretShare,
    proof,
  };
}

/**
 * @brief Verify all received proofs and compute own secret share if all are valid
 * @param {Array} ephemerals Array of commitments of all parties involved in the AV-net
 *                                     along with corresponding ZKPs
 * @param {number} ownIndex Index into the ephemerals where own commitment can be found
 * @return Share of the secret or null if any of the proofs are invalid
 */
function getSecretShareIfProofsValid(ephemerals, ownIndex) {
  const partiesCount = ephemerals.length;
  /* Start with the group identity */
  let secretShare = zkp.pointAtInfinity;

  for (let i = 0; i < partiesCount; i += 1) {
    /* Verify proof */
    if (!zkp.verifyZeroKnowledgeProof(ephemerals[i].proof, ephemerals[i].commitment)) {
      console.error(`ZKP verification failed for party ${i}`);
      return null;
    }

    if (i < ownIndex) {
      /* For indices lower than ours add the commitment */
      secretShare = secretShare.add(ephemerals[i].commitment);
    } else if (i > ownIndex) {
      /* For indices higher than ours subtract the commitment */
      secretShare = secretShare.add(ephemerals[i].commitment.neg());
    } else {
      /* Ignore our own commitment */
    }
  }

  return secretShare;
}

/**
 * @brief Verify all received proofs and compute the shared secret if all are valid
 * @param {Array} secretShares Array of secret shares of all parties involved in the AV-net
 *                             along with corresponding ZKPs
 * @return Network result (0 or 1) or -1 if any of the proofs are invalid
 */
function getFinalResultIfProofsValid(secretShares) {
  const partiesCount = secretShares.length;
  /* Start with the group identity */
  let finalResult = zkp.pointAtInfinity;

  for (let i = 0; i < partiesCount; i += 1) {
    /* Verify proof */
    if (!zkp.verifyZeroKnowledgeProof(
      secretShares[i].proof,
      secretShares[i].commitment,
      secretShares[i].basePoint,
    )) {
      console.error(`ZKP verification failed for party ${i}`);
      return -1;
    }

    finalResult = finalResult.add(secretShares[i].commitment);
  }

  /* Result of the network is 1 if the shared secret is distinct from the identity */
  return Number(!finalResult.eq(zkp.pointAtInfinity));
}

export default {
  getEphemeralCommitmentWithProof,
  commitToVeto,
  getSecretShareIfProofsValid,
  getFinalResultIfProofsValid,
};
