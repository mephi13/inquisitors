/* eslint-disable */

/* TODO: Propagate permanent keys from the application down to this helper module */
import forge from 'node-forge';
import { tlsCreateConnection } from './TLS';
const EC = require('elliptic').ec;

/* Create and initialize EC context */
const ec = new EC('curve25519');

function getChallenge(ephemeral) {
  /* Get Schnorr-NIZKP challenge, i.e. hash over ephemeral */
  return ephemeral.hashInt();
}

function getZeroKnowledgeProof(secretExponent, publicCommitment) {
  /* */
  const ephemeral = ec.getKeyPair();
  const ephExponent = ephemeral.getPrivate();
  const response = ephExponent - secretExponent * getChallenge(ephemeral);
  return { response, ephemeral };
}

function getCommitment() {
  /* TODO: Produce a commitment value and a non-interactive ZKP */
  const key = ec.getKeyPair();

  return {
    ephemeral: key.getPublic().encode('hex'),
    proof: getZeroKnowledgeProof()
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
  establishNetwork: (socket, ownName, peers) => {
    const connections = peers.map((player) => {
      return tlsCreateConnection(
        (ownName > player), /* Decide who is the server based on alphabetical order */
        (receivedData) => {
          console.log(`Received data from ${player}`);
        },
        (dataToSend) => {
          console.log(`Sending data to ${player}`);
          this.socket.emit('route_tls', {
            roomId: this.roomId,
            payload: btoa(dataToSend),
            receiver: player,
          });
        },
        player
      );
    });

    return {
      socket,
      ownName,
      peers,
      connections,
    };
  },

  runProtocol: (network, myResponse) => {
    return (async function() {
      const receivedCommitments = [];
      const receivedResponses = [];
      const tlsConnections = peers.map((player) => {

      });

      /* Register an event listener on the socket */
      socket.on('tls_message', (data) => {
        console.log('Handling tls_message');
        data.sender;


        this.tlsClient.process(atob(data.payload));
      });

      return Promise.all(self.players.map((player, i) => {
        return new Promise((resolve, reject) => {
          /* For each player establish a TLS connection */
          console.log(`Establishing connection with ${player}`);


          const commitment = getCommitment();
          console.log(`Running handshake with ${player}...`);
          if (!amITheServer(player)) {

            tls.handshake();
          }
          console.log(`Sending commitment to ${player}...`);
          tls.prepare(forge.util.encodeUtf8(commitment));
        });
      }))
    })();
  }
}
