/* eslint-disable */

import forge from 'node-forge';
import axios from 'axios';

const tlsCaAuthority = `
-----BEGIN CERTIFICATE-----
MIIDpzCCAo+gAwIBAgIUaJVhZG9wP39gweNUBlsnBS10HFgwDQYJKoZIhvcNAQEL
BQAwYzELMAkGA1UEBhMCUEwxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDENMAsGA1UECwwEdW5pdDENMAsGA1UE
AwwEUm9vdDAeFw0yMjA2MjExMTQ3MjJaFw0yNjA2MjAxMTQ3MjJaMGMxCzAJBgNV
BAYTAlBMMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQxDTALBgNVBAsMBHVuaXQxDTALBgNVBAMMBFJvb3QwggEi
MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCu943HVBAEbKC9xZ6wdkmCDqLU
cIENO5gQOMZgKNm/jbVqxgsPjG/hRUzKfJlq/t+Lw5YoU0vxfK27L0/jn+qRPLVt
b83Lpb6DlsuSIws0U7axT8xQfXZgU44Ng7E8FHILqCwtt5wig4dLIkewZxLrcb0n
hmgMLZPIVs75bkWC3Dgnl/J7AHPkaLUpu69iU3jShhLGXFShhZWNjAO3fcz5pEFi
XBNeeuWIp4GI0A7A19HGoVUbWKVWgvPE+s2KWfKIQrXYN6GsIAUiB5loT9UOYGv3
U01dzW6jbaAerKGOe9t93WxQzhaBSKEhJ58TUFzo9iRG9+YyjxD0mmIz++APAgMB
AAGjUzBRMB0GA1UdDgQWBBRvfB7mQteplnZle9EhdwAh2qKYUjAfBgNVHSMEGDAW
gBRvfB7mQteplnZle9EhdwAh2qKYUjAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3
DQEBCwUAA4IBAQAE9jE7w1ec/jRQ/zvgZL2AmoqQn3JwRFLR2znZq3i+BGhggNLi
uwwHXNDE9Vro0WKXPpMPW0W78EHphQj/171qg5jVYewAWXOfd+f7q/6WmZqqte+p
ihBD2A/Mok3hk178TFeeXp8oLTcnWqkhpVKsE2iSl37doYg/RUedHwHyfO59DnmM
C52zJDTn01kcrrB03BGf7LEAFjZeopg+JvtkmPCctYdda2N3Hp0NuYyVE97/C7Gr
8f7kY2FGq9N7ksRLfbSUOk2Yz9LPkpkhG4kkJWuDyXpIoWKM8d2/ee7MKObGuy2B
O+EIDFt0lmJxMLUKqiextRlO1AVznWr53Rkq
-----END CERTIFICATE-----
`;

const keys = forge.rsa.generateKeyPair(2048);

const tlsPublicKey = keys.publicKey;
const tlsPrivateKey = keys.privateKey;
const tlsPrivateKeyPem = forge.pki.privateKeyToPem(tlsPrivateKey);

// generate cert
const tlsCert = forge.pki.createCertificate();
tlsCert.publicKey = tlsPublicKey;
tlsCert.serialNumber = '02';
tlsCert.validity.notBefore = new Date();
tlsCert.validity.notAfter = new Date();
tlsCert.validity.notAfter.setFullYear(tlsCert.validity.notBefore.getFullYear() + 1);
const attrs = [{
  name: 'commonName',
  value: 'Bob',
}, {
  name: 'countryName',
  value: 'US',
}, {
  shortName: 'ST',
  value: 'Virginia',
}, {
  name: 'localityName',
  value: 'Blacksburg',
}, {
  name: 'organizationName',
  value: 'Test',
}, {
  shortName: 'OU',
  value: 'Test',
}];
tlsCert.setSubject(attrs);
tlsCert.setIssuer(forge.pki.certificateFromPem(tlsCaAuthority).subject.attributes);

let tlsCertPem = '';

function setCert(cert){
  tlsCertPem = cert
  console.log(tlsCertPem)
}

function sign(tlsCertPem) {
  const path = 'http://inquisitors.localdomain:15000/sign';
  axios.post(path, { cert : btoa(tlsCertPem), })
    .then((res) => {
      setCert(res.data.signedCert)
    })
    .catch((err) => {
      console.error(err);
    });
}

// self sign the certificate <- hack coz library is fucked
tlsCert.sign(tlsPrivateKey)
sign(forge.pki.certificateToPem(tlsCert))

/**
 * @brief Create a connection object
 * @param {boolean} isServer Flag indicating whether we should take the role of the server
 * @param {Function} onDataReceived Function called when new data is received
 * @param {Function} routerCallback Function called with prepared data ready to be sent
 * @param {str} peerName Name of the peer party, later passed to the routerCallback
 * @returns A TLS connection object
 */
function createConnection(isServer, onDataReceived, routerCallback, peerName) {
  /* Use easily overridable function */
  const debugLog = (message) => { console.log(message); };

  return forge.tls.createConnection({
    server: isServer,
    caStore: [tlsCaAuthority],
    sessionCache: {},
    // supported cipher suites in order of preference
    cipherSuites: [
      forge.tls.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA,
      forge.tls.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA],
    verifyClient: true,
    verify(connection, verified, depth, certs) {
      console.assert(connection, depth, certs);
      /* TODO: Check also common name */
      // return verified && certs[0].subject.getField('CN').value === peerName;
      return verified;
    },

    connected: function connect(connection) {
      console.assert(connection);
      debugLog(`Established TLS connection with ${peerName}`);
    },

    getCertificate(connection, hint) {
      console.assert(connection, hint);
      return tlsCertPem;
    },

    /* the private key for the client-side cert if provided */
    getPrivateKey(connection, cert) {
      console.assert(connection, cert);
      return tlsPrivateKeyPem;
    },
    tlsDataReady(connection) {
      /* Encrypted TLS data is ready to be sent */
      const bytes = connection.tlsData.getBytes();
      routerCallback(bytes, peerName);
    },
    dataReady(connection) {
      const message = forge.util.decodeUtf8(connection.data.getBytes());
      onDataReceived(message);
    },
    closed: function closed() {
      console.log('[TLS] disconnected');
    },
    error: function errorTLS(connection, error) {
      console.assert(connection);
      console.log('[TLS] error: ', error);
    },
  });
}

export default {
  createConnection,
};
