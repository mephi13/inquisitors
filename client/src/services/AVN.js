/* TODO: Propagate permanent keys from the application down to this helper module */
import forge from 'node-forge';
import { tlsCreateConnection } from './TLS';

function getCommitment() {
  /* TODO: Produce a commitment value and a non-interactive ZKP */
  return { ephemeral: 0, proof: '' };
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
