import forge from 'node-forge';

const oldCaAuthority = `
-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUUkcvsMdSt+L4RdgOUq7L0/SZhjEwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yMjA2MjAyMTAwMzZaFw0yNjA2
MTkyMTAwMzZaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQCnDDhh3C+R4JeFMOH/KoaMUPLNZfh16+CT0sWjhyDP
oSFE7UcU+Fb1PkzUfk0p7hTpdiZG4PYvTQpzu4i+K2IusEzYgwqBtBb8RRY28p05
2BMmhhAQxcQShEGJCQ/UTD3A48yKNbcppg6nfJGSBK0brfgT3x2E4NtSyFBTe9ZY
HlXOz1E2LG1M8hoLb9wQiR8KT8FLy1G5ZRMy5lEN+oX9hSXaV1muer1VO0+FyZxU
KtldR8Y9+heA95QyUvaQyyddxyIv3801h1tQs/npOGd4/S07Zqg2ufj/3xY/zhIs
5tn2EBAslbcsDFXh96urmLgJx+My7naZlYODXJjLAp/ZAgMBAAGjUzBRMB0GA1Ud
DgQWBBRL28Za0TgggIZ8Mq7+hO41rEWjWjAfBgNVHSMEGDAWgBRL28Za0TgggIZ8
Mq7+hO41rEWjWjAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQBN
DQ60qRMIPrNsAoX73BHNO3Rp8tAEZjKP7OyWxOEACJV8EuiTUUw38TmCdHLrb+P4
sR4ApozcXWLs6n+8yhL40kSW24FrxauS4ucMeGdVTRySqF9c8M+/J0O+nI8ZrIDn
UkjllrtaA+5slm17KpNFBZIqiJah3MydpG0l2dLNhUStQ5N5AT/r9T7UE4rJ/x1t
SQqOOANrU7MFwaDy1oIB4uGK3b2+kjpR5GXijDc06kEaQ84cSt2P3AwqKM0I44Nd
Sa0mpe+OdgN0ruxJvu9SKW+B1zIncMKJV3RKT5qAxpoZx6yuPL1UJV8VOaPN5Wgg
uJKJX9Dc1NgZ8ktwuCpJ
-----END CERTIFICATE-----
    `;

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
// to sign the client side certificate, PoC only
const caAuthorityPrivateKey = `
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEArveNx1QQBGygvcWesHZJgg6i1HCBDTuYEDjGYCjZv421asYL
D4xv4UVMynyZav7fi8OWKFNL8Xytuy9P45/qkTy1bW/Ny6W+g5bLkiMLNFO2sU/M
UH12YFOODYOxPBRyC6gsLbecIoOHSyJHsGcS63G9J4ZoDC2TyFbO+W5Fgtw4J5fy
ewBz5Gi1KbuvYlN40oYSxlxUoYWVjYwDt33M+aRBYlwTXnrliKeBiNAOwNfRxqFV
G1ilVoLzxPrNilnyiEK12DehrCAFIgeZaE/VDmBr91NNXc1uo22gHqyhjnvbfd1s
UM4WgUihISefE1Bc6PYkRvfmMo8Q9JpiM/vgDwIDAQABAoIBAC8rRemq2/aVYnBG
ypVADmklkPg8rE3o9wHIjJJ38NwXVAVJBspWTgMpL56XILUbqSCAxgZxDlQ4DI4e
Hyd6gT5OY4rxTUXNlSLckF0BXY/p0aLTpH0+lZ86Z111V16fFG/YErDwgwM6+kpj
H3iLESqwKxJwxbQixWiJHptYAx1X1x632AwadUbMgaTMwi92lXcjlO9YxyQlMB90
KqYI5PD5rJj/F++Xs3+plKjvVeVilhdWl/dGf7u0jB4FqpMiCGNTqp3VHmnhWP9N
U4Wu6FKw2RIF/xoih+CJ+VCOJP3PUnUR463alsD4RNJjAi28WaxdPXfAYltvRLFF
ynCm4OECgYEA0/j3VfkIIeoQzGFWg+E5sLjTIJYDse4WBGX94UFavBe4zslJ9hRj
qqSh7xXO00huBGlnEicJ20CeSF7TwlGH5Me5T2fUj/Vrg1qBgiTsjc8CrGk/wZk9
FqlXkKkjU61wmsoAUntq85yyV/3dHYLQpyrIBDyIrosVw6m15cpimisCgYEA007s
yTGpej2MeH/a5altohzt8jRSDN3MWoyDf3O1mSwgOXiAvhVpix0YOtaibh14aklH
t8U10uvPzqh9C3E0akqInli+dxi3IZ4qiNEs8VStgHSHyw5SEVb3QgUMREI8G3zq
IW4D9eyKnDYDjrXJf7c9sHUbq2YS43QfYBf5k60CgYBY8HuG3SimYjmOJ8FPMG8u
UT50y7zdKVKfodO2cd+KUEHAsgCQedmfvdgcIwBW8msG+tq+aRbfoetH3lHnlKH6
QjrksGIlzQnBYXY5jxiaH6O1h6uypYNWQNN25SDneTxoFh2wfgxQDw1dkiz2tu6p
VW/7JxMKeV02bbzen95jZQKBgQCgR/ql9eyW037snBa/I9AMKqN2l6cxKUBr4q+Q
CoXR5L2guj31cSp4oh4R62KT4fjHrkQfKhDUp5geKoGHH1xhz51ndusqTW4DqwSa
eQf9GnzstfeW14r6qhutUUTntdIAC7VQnDGW5dCSAwqZwlxQav75DStqzGdBboCq
FCV0lQKBgDgKKtne5JukFyZATXSL4i9CBISdI2FSwH/Zfo+QT/To7FvNepsAYqzJ
g2agFKSyMj1lD8CzQ+AYPTQFomoLSWNoTKOHyJlgNKwAsscKpXXA3abtNNoeBRcB
fL5rDim/Pka/moACbo7VI72h8Y5EwsaszNrRs9JvLIvZx1yDlbs1
-----END RSA PRIVATE KEY-----
`;

const keys = forge.rsa.generateKeyPair(2048);

const tlsPublicKey = keys.publicKey;
const tlsPrivateKey = keys.privateKey;
const tlsPrivateKeyPem = forge.pki.privateKeyToPem(tlsPrivateKey);
console.assert(caAuthorityPrivateKey);

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

// sign the certifiacte
const caPrivKey = forge.pki.privateKeyFromPem(caAuthorityPrivateKey);

tlsCert.sign(caPrivKey);

const tlsCertPem = forge.pki.certificateToPem(tlsCert);

function tlsCreateConnection(isServer, onDataReceivedCallback, sendDataCallback, withUser) {
  return forge.tls.createConnection({
    server: isServer,
    caStore: [tlsCaAuthority, oldCaAuthority],
    sessionCache: {},
    // supported cipher suites in order of preference
    cipherSuites: [
      forge.tls.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA,
      forge.tls.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA],
    verifyClient: true,
    verify: function verif(connection, verified, depth, certs) {
      // const cn = certs[0].subject.getField('CN').value;
      // let newVerified = null;
      // if we want some additional verification
      /* if (depth === 0) {
        if (cn !== 'Alice') {
          newVerified = {
            alert: forge.tls.Alert.Description.bad_certificate,
            message: '[TLS] Certificate common name does not match hostname.',
          };
          return newVerified;
        }
      } */
      console.assert(connection, depth, certs);
      return verified;
    },
    connected: function connect(connection) {
      console.assert(connection);
      console.log('[TLS] connected');
      // send message to server
      // connection.prepare(forge.util.encodeUtf8('Hi server!'));
    },
    getCertificate: function getCert(connection, hint) {
      console.assert(connection, hint);
      // console.log(tlsCertPem);
      return tlsCertPem;
    },
    /* the private key for the client-side cert if provided */
    getPrivateKey: function getKey(connection, cert) {
      console.assert(connection, cert);
      // console.log('[TLS] private key');
      return (tlsPrivateKeyPem);
    },
    tlsDataReady: function tlsDataReady(connection) {
      // TLS data (encrypted) is ready to be sent to the server:
      const bytes = connection.tlsData.getBytes();
      console.log('[TLS] sending data to TLS server: ', bytes);
      sendDataCallback(bytes, withUser);
    },
    dataReady: function dataReady(connection) {
      // clear data from the server is ready
      const message = forge.util.decodeUtf8(connection.data.getBytes());
      console.log('[TLS] the server sent: ', message);
      onDataReceivedCallback(message);
      // vm.processDataFromTlsServer(message);
      // close connection
      // connection.close();
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

export {
  tlsCaAuthority,
  tlsPublicKey,
  tlsPrivateKey,
  tlsCert,
  tlsCertPem,
  tlsPrivateKeyPem,
  tlsCreateConnection,
};
