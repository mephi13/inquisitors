/* Implement the messaging logic of the anonymous veto netowrk */

import avnet from '@/libs/avnet-core';
import tls from '@/libs/tls';
import zkp from '@/libs/zkp';

/**
 * @brief Determine whether or not we should act as a server when communicating with peer
 * @param {Object} self Our player object
 * @param {Object} peer Peer player object
 * @returns True if we are the server, false otherwise
 */
function amServer(self, peer) {
  /* We are the server for peers with lower indices than ours */
  return self.index > peer.index;
}

/**
 * @brief Establish secure channels with all other players
 * @param {Object} params Network parameters
 * @return Network handle
 */
function establishSecureNetwork(params) {
  /* Remove self from the players list */
  const peers = params.players.filter((player) => player.name !== params.ownName);
  /* Find self */
  const me = params.players.find((player) => player.name === params.ownName);
  const router = (payload, receiver) => {
    /* Send the data to the socket */
    params.socket.emit('route_tls', {
      roomId: params.roomId,
      receiver,
      payload,
    });
  };

  const connections = peers.map((peer) => {
    let onEphemeralCommitment;
    let onSecretShare;
    let onConnected;
    const onDataReceived = (data) => {
      switch (data.messageType) {
        case 'ephemeralCommitment':
          onEphemeralCommitment(data.messagePayload);
          break;
        case 'secretShare':
          onSecretShare(data.messagePayload);
          break;
        default:
          console.error(`Received invalid data from peer ${peer}: ${data.messageType}`);
          break;
      }
    };
    const promiseOnEphemeralCommitment = new Promise((resolve) => {
      onEphemeralCommitment = resolve;
    });
    const promiseOnSecretShare = new Promise((resolve) => {
      onSecretShare = resolve;
    });
    const promiseOnConnected = new Promise((resolve) => {
      onConnected = resolve;
    });

    return {
      peer,
      connection: tls.createConnection(
        amServer(me, peer),
        onConnected,
        onDataReceived,
        router,
        peer.name,
      ),
      promiseOnConnected,
      promiseOnEphemeralCommitment,
      promiseOnSecretShare,
    };
  });

  params.socket.on('tls_message', (data) => {
    const conn = connections.find((connection) => connection.peer.name === data.sender);
    tls.handleDownstreamMessage(conn.connection, data.payload);
  });

  return {
    socket: params.socket,
    self: me,
    connections,
  };
}

/**
 * @brief Run anonymous veto network
 * @param {Object} network Network handle returned by establishSecureNetwork
 * @param {boolean} veto Own input to the protocol
 * @return Game result or -1 on failure
 */
async function runAnonymousVeto(network, veto) {
  const players = network.connections.map((connection) => connection.peer);
  players.push(network.self);

  /* Wrap in a promise */
  /* Run a handshake with each peer */
  network.connections.map((connection) => {
    if (!amServer(network.self, connection.peer)) {
      console.log(`Running handshake with ${connection.peer.name}...`);
      connection.connection.handshake();
    }
    return null;
  });
  console.log('Waiting for handshakes to complete...');
  /* Wait for handshakes to complete */
  await Promise.all(network.connections.map((connection) => connection.promiseOnConnected));
  console.log('Handshakes done');

  /* Generate commitment */
  const ephemeral = avnet.getEphemeralCommitmentWithProof();

  console.log('Sending out ephemeral commitment...');
  /* Send out the commitment to all peers */
  network.connections.map((connection) => {
    const payload = {
      messageType: 'ephemeralCommitment',
      messagePayload: {
        sender: network.self.name,
        commitment: zkp.commitmentToJson(ephemeral.publicValues),
      },
    };
    return tls.sendData(connection.connection, payload);
  });

  console.log('Waiting for commitments of other parties...');
  /* Wait for commitments from peers */
  const commitmentsInJson = await Promise.all(
    network.connections.map((connection) => connection.promiseOnEphemeralCommitment),
  );
  const commitments = commitmentsInJson.map((commitment) => ({
    sender: commitment.sender, commitment: zkp.commitmentFromJson(commitment.commitment),
  }));

  /* Add own commitment to the list */
  commitments.push({
    sender: network.self.name,
    commitment: ephemeral.publicValues,
  });

  console.log('All commitments received');

  /* Sort the elements */
  commitments.sort((commit1, commit2) => {
    /* Map sender name to index in players' list */
    const index1 = players.find((peer) => peer.name === commit1.sender).index;
    const index2 = players.find((peer) => peer.name === commit2.sender).index;
    return index2 - index1;
  });

  /* Find own index into the array */
  const ownIndex = commitments.findIndex((commitment) => commitment.sender === network.self.name);

  console.log('Obtaining the intermediate secret share...');
  /* Strip the sender data */
  const strippedCommitments = commitments.map((commitment) => commitment.commitment);
  /* Obtain the intermediate share */
  const intermediateShare = avnet.getSecretShareIfProofsValid(strippedCommitments, ownIndex);
  /* TODO: Add error handling if any of the proofs is invalid */
  console.assert(intermediateShare);
  const secretShare = avnet.commitToVeto(veto, ephemeral.secret, intermediateShare);

  console.log('Sending out our secret share...');
  /* Send out own secret share */
  network.connections.map((connection) => {
    const payload = { messageType: 'secretShare', messagePayload: avnet.vetoToJson(secretShare) };
    return tls.sendData(connection.connection, payload);
  });

  console.log('Waiting for the secret shares of other parties...');
  /* Wait for peers' secret shares */
  const secretSharesInJson = await Promise.all(
    network.connections.map((connection) => connection.promiseOnSecretShare),
  );
  const secretShares = secretSharesInJson.map((share) => avnet.vetoFromJson(share));

  /* Add own secret share to the list */
  secretShares.push(secretShare);

  return avnet.getFinalResultIfProofsValid(secretShares);
}

export default {
  establishSecureNetwork,
  runAnonymousVeto,
};
