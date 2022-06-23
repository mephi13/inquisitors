import sha256 from 'crypto-js/sha256';

const BN = require('bn.js');
const EC = require('elliptic').ec;

/* Create and initialize EC context */
const ec = new EC('secp256k1');

/**
 * @brief Hash an elliptic curve point to an integer
 * @param {curve.base.BasePoint} point Elliptic curve point
 * @return Hash over the point
 */
function hashPoint(point) {
  /* Encode the point as hex */
  const encoding = point.encode('hex');
  /* Hash the encoding (note that 'sha256' returns an object which can be cast to string) */
  const hash = String(sha256(encoding));
  /* Parse the hash as a big integer */
  return new BN(hash, 16);
}

/**
 * @brief Generate a random exponent (scalar) in the elliptic curve group
 * @return Scalar
 */
function getRandomExponent() {
  /* Generate a temporary key pair */
  const pair = ec.genKeyPair();
  /* Return the secret key */
  return pair.getPrivate();
}

/**
 * @brief Get non-interactive zero-knowledge proof of knowledge of the discrete logarithm
 * @param {BN} secretExponent Secret exponent knowledge of which we prove
 * @param {curve.base.BasePoint} basePoint Generator of the group
 * @return Zero-knowledge proof of knowledge of the discrete logarithm
 */
function getZeroKnowledgeProof(secretExponent, basePoint = ec.curve.g) {
  /* Generate an ephemeral commitment */
  const ephSecret = getRandomExponent();
  const ephPublic = basePoint.mul(ephSecret);
  /* Get Schnorr challenge as a hash over the public ephemeral */
  const challenge = hashPoint(ephPublic);
  /* Calculate Schnorr response */
  const response = ephSecret.add(secretExponent.mul(challenge));

  return {
    commitment: ephPublic,
    response,
  };
}

/**
 * @brief Verify the zero-knowledge proof of knowledge of the discrete logarithm
 * @param {Object} proof Proof of knowledge of the discrete log of the publicValue
 * @param {curve.base.BasePoint} publicPoint Public point the proof pertains to
 * @param {curve.base.BasePoint} basePoint Generator of the group
 */
function verifyZeroKnowledgeProof(proof, publicPoint, basePoint = ec.curve.g) {
  /* Multiply the base point by the 'response' from the proof */
  const lhs = basePoint.mul(proof.response);
  /* Get Schnorr challenge as a hash over the commitment */
  const challenge = hashPoint(proof.commitment);
  const rhs = publicPoint.mul(challenge).add(proof.commitment);

  return lhs.eq(rhs);
}

/**
 * @brief Generate a random commitment and produce a non-interactive zero-knowledge
 *        proof of knowledge of the corresponding discrete logarithm
 * @note This API does not support using custom group generators
 */
function getRandomCommitmentAndProof() {
  /* Generate a new key pair */
  const pair = ec.genKeyPair();

  return {
    secret: pair.getPrivate(),
    publicValues: {
      commitment: pair.getPublic(),
      proof: getZeroKnowledgeProof(pair.getPrivate()),
    },
  };
}

/**
 * @brief Convert commitment object to plain JSON
 * @param {Object} commitmentObject Typed commitment object
 * @return JSON
 */
function commitmentToJson(commitmentObject) {
  return {
    commitment: commitmentObject.commitment.encode(),
    proof: {
      commitment: commitmentObject.proof.commitment.encode(),
      response: commitmentObject.proof.response.toString(),
    },
  };
}

/**
 * @brief Recover commitment object form plain JSON
 * @param {Object} jsonObject JSON object
 * @return Typed commitment object
 */
function commitmentFromJson(jsonObject) {
  return {
    commitment: ec.keyFromPublic(jsonObject.commitment, 'hex').getPublic(),
    proof: {
      commitment: ec.keyFromPublic(jsonObject.proof.commitment, 'hex').getPublic(),
      response: new BN(jsonObject.proof.response),
    },
  };
}

export default {
  /* Hack to recover the point at infinity */
  pointAtInfinity: (function () {
    /* Generate random point */
    const pair = ec.genKeyPair();
    const pubKey = pair.getPublic();
    /* Subtract the point from itself */
    return pubKey.add(pubKey.neg());
  }()),
  getZeroKnowledgeProof,
  getRandomCommitmentAndProof,
  verifyZeroKnowledgeProof,
  commitmentFromJson,
  commitmentToJson,
  ec,
};
