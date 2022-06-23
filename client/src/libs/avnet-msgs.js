/* Implement the messaging logic of the anonymous veto netowrk */

import avnet from '@/libs/avnet-core';
import tls from '@/libs/tls';

const messageHandlers = {
  /* TODO: Implement handlers for specific types of peer-to-peer messages */
};
console.assert(messageHandlers);

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

  const onDataReceived = () => {};

  const router = (payload, receiver) => {
    /* Send the data to the socket */
    params.socket.emit('route_tls', {
      roomId: params.roomId,
      receiver,
      payload,
    });
  };

  const connections = peers.map((peer) => ({
    peer,
    connection: tls.createConnection(amServer(me, peer), onDataReceived, router, peer),
  }));

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
function runAnonymousVeto(network, veto) {
  const peers = network.connections.map((connection) => connection.peer);
  const commitments = [
    { sender: null, commitment: null },
  ];
  const secretShares = [
    { proof: null, commitment: null, basePoint: null },
  ];

  /* Run a handshake with each peer */
  network.connections.map((connection) => {
    if (!amServer(network.self, connection.peer)) {
      connection.connection.handshake();
    }
    return null;
  });

  /* Generate commitment */
  const ephemeral = avnet.getEphemeralCommitmentWithProof();

  /* Send out the commitment to all peers */
  network.connections.map((connection) => {
    /* TODO: Implement me! */
    console.assert(connection);
    return null;
  });

  /* Await commitments from peers */
  /* TODO: AWAIT */

  /* Add own commitment to the list */
  commitments.push({
    sender: network.self.name,
    commitment: ephemeral,
  });

  /* Sort the elements */
  commitments.sort((commit1, commit2) => {
    /* Map sender name to index in players' list */
    const index1 = peers.find((peer) => peer.name === commit1.sender).index;
    const index2 = peers.find((peer) => peer.name === commit2.sender).index;
    return index1 < index2;
  });

  /* Find own index into the array */
  const ownIndex = commitments.findIndex((commitment) => commitment.sender === network.self.name);

  /* Obtain the intermediate share */
  const intermediateShare = avnet.getSecretShareIfProofsValid(commitments, ownIndex);
  /* TODO: Add error handling if any of the proofs is invalid */
  console.assert(intermediateShare);
  const secretShare = avnet.commitToVeto(veto, ephemeral.secret, intermediateShare);

  /* Send out own secret share */
  network.connections.map((connection) => {
    /* TODO: Implement me! */
    console.assert(connection);
    return null;
  });

  /* Wait for peers' secret shares */
  /* TODO: AWAIT */

  /* Add own secret share to the list */
  secretShares.push(secretShare);

  return avnet.getFinalResultIfProofsValid(secretShares);
}

export default {
  establishSecureNetwork,
  runAnonymousVeto,
};
