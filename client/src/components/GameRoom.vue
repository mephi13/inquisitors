<template>
  <div class="container">
    <h1> Room: {{ roomId }} </h1>
    <form v-on:submit.prevent="submitQuestion(questionSubmission)">
      <label for="userQuestion">Question:
        <input type="text" placeholder="Submit your question..." v-model="questionSubmission"
          id="userQuestion" />
      </label>
      <input type="submit" value="Send" />
    </form>
  </div>
  <hr />
  <p> Players: </p>
  <div v-for="player in players" :key="player" class="container">
    <div class="container">
      {{ player }}
    </div>
  </div>
  <form v-on:submit.prevent="connectToTlsServer()">
    <input type="submit" value="Test connection to TLS Server" />
  </form>
  <form v-on:submit.prevent="sendMesageToTlsServer(testMessage)">
    <label for="messageToServer">Test Message:
      <input type="text" placeholder="Send Test message to TLS server." v-model="testMessage"
        id="messageTest" />
    </label>
    <input type="submit" value="Send" />
  </form>
  <div>{{messageFromTlsServer}}</div>
</template>

<script>
import { io } from 'socket.io-client';
import forge from 'node-forge';

export default {
  name: 'GameRoom',
  data() {
    return {
      socket: null,
      userName: this.$route.query.userName,
      players: [],
      questionSubmission: '',
      chosenQuestion: '',
      responsePrompt: '',
      respondersSubset: [],
      testMessage: '',
      messageFromTlsServer: '',
    };
  },
  props: ['roomId'],
  methods: {
    /* TODO: Listen for notification about new player in the room */

    startGame() {
      console.log('Implement me!');

      this.socket.emit('game_start', {
        roomid: this.roomId,
      });
    },

    submitQuestion(question) {
      this.socket.emit('question_submit', {
        roomId: this.roomId,
        question,
      });
    },

    submitResponse(response) {
      /* TODO: Implement anonymous veto network */
      console.log('Implement me!');
      console.assert(response);
      /* TODO: Run AVN then notify the server */
      this.socket.emit('avnet_complete', {
        roomId: this.roomId,
      });
    },

    submitVote(vote) {
      console.log('Implement me!');
      this.socket.emit('public_vote_submit', {
        roomId: this.roomId,
        vote,
      });
    },

    sendMesageToTlsServer(message) {
      console.log('Sending message to TLS server: ', message);
      // when encrypted TLS data is received from the client, process it
      this.client.prepare(forge.util.encodeUtf8(message));
    },

    connectToTlsServer() {
      console.log('Connecting to TLS server...');
      // start the handshake process
      this.client.handshake();
    },

    processDataFromTlsServer(message) {
      console.log('Processing message from TLS server: ', (message));
      // when encrypted TLS data is received from the server, process it
      this.messageFromTlsServer = message;
    },
  },

  created() {
    this.socket = io('ws://inquisitors.localdomain:15000');
    this.socket.emit('room_join', {
      userName: this.userName,
      roomId: this.roomId,
    });

    this.socket.on('room_update', (data) => {
      /* Update the players' list */
      this.players = data.users.map((user) => user.name);
    });

    this.socket.on('response_prompt', (data) => {
      this.chosenQuestion = data.question;
      if (data.promptUser) {
        /* TODO: Wait for user input, then run anonymous veto network */
        this.responsePrompt = 'Answer the inquisitor\'s question or burn';
      } else {
        /* TODO: Wait for user input, then run anonymous veto network with answer set to 0 */
        this.responsePrompt = 'Enter an answer so that no one knows you are part of the grand inquisition';
      }
    });

    this.socket.on('public_vote_prompt', (data) => {
      /* Save a list of players whose votes actually counted */
      this.respondersSubset = data.respondersSubset;
      /* TODO: Prompt the user to name a heretic */
    });

    this.socket.on('public_vote_reveal', (data) => {
      /* TODO: Handle notification about the condemned heretic */
      console.assert(data.results);
      console.assert(data.heretic);
      /* TODO: Check if game should continue (enough players) */
    });

    /* TLS PoC */
    const caAuthority = `
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

    this.myClientPrivKey = `
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD0GnkrXmY8xWm6
oIfbdAN2DYms6B5DtJ1c7PBxRmKh6a7KUbUct+0CAyxcz5VgJdYHe9eHYCR10qdw
ONWQbREdh+XER8ecV0MliUHUB0vbCttv/TY5wK0EL9eoS1Xew+JX/8c/uceDtBnJ
O33bfxdveOLhl023l6nb2kZxSVipPWU/X4LWRDRW7m1uqul55D3VJyxaauLtL7qL
rm04kT9ACu1W3dhnNbvKGsqFQwP8iALaGvugR0zpCzzyK0bhPlzO6b+A2QTZ83KE
A/WkRzEk4H+SkdjkCPu/FImTZmlOXMKGUjSLzonXsZTExH/9T8HkbvE/9BuoULU/
ukq+zU6VAgMBAAECggEAFIIM4AnkSQLE6TsHbvaGO+rTQEWYFVQdTGtToBCrxLKf
TrwinTEOpnahyYJfKF7FZoePCf6X0ZZLHvCHcMTZBUQfl6f4Kzhhmcu4Thn204ZL
/VKmtZ9sacejNK5vnnGSmJYSpVX0XypIaFGpN0GsNF9RoGZXzy7cxG3IMUhaPI2T
6lTcA8jivIBl/XpjfRhghqVJklqRIhYK0EWYmYeLU3tKH4yC+Aa3uda86oHxyXXj
zHAELj0eEsagr2WuZYjZtKfz+Q+tdAUQyESHufRJ+7XXTwTq1nxdWrTd9DXfqHJO
M91TZTocaFsklyXM7VaJsnho3YtUQDwXa2wfdCYRWQKBgQD/jshjkJX6Q1fo7LqI
I4z1HFP4C+ans8UUgLkRTFPBTFlgGsm2kYQ5htKB/K4dcGJRkZFPu4UKCZV9KyP+
8dvjw8FL+i8BfAnaBFh4iHGiXqGCQ1J2zvNAxlzUUZEXxDyXcpvRxOfVWdkai9LO
t9ug8eKdlugeaxjltF5JuBiHHwKBgQD0hp21U8XqOiA2TyYtGedvc3arcWGR8/3m
71JO2hm+iCtLFIdScXcfe20qQQhhOmytjG2+8c9btL7FWwz2g0XeDZdzkmWkWH62
qIYzQKhGVexGRCvcq5Q0Fkco+pyCEK7gfdXZxxww48hwce2wwOAiY26xrMHi2bQP
izHWy923ywKBgGzkVSR/ljhF+65nOHAL3eMPSAQ4ZfbtVbuPwcvKHyINO0QFBhBB
3vp4JTh4B2TJ30rsYON9fomxXb4w5KycN9rMLZAHMYJLbRM1qNDrKqhJ9D3CG+A9
/E6Mdz+M5esflcXecuCmKzawix6Rl6i3lOD2UF5fz9YuQjSWb1qwE9t3AoGAZ+C8
JKjm/h8dShULscM8Z0NU2XY8LeXKKg3nGGpc3203fxjEeAiNw4kKkhW4ep14R63N
fX16SooZNPv+IMcZqkB543YAyfVyNySWhjVkhyS/UAZr373gItSH/GeijzqJIAM1
EuQcHMTXhLVRdXIqhVFaWA58+2LitGu8i3Rlx0sCgYEAhpojND9nchD5lmlMshoo
OHvD/1O0IbHY3y1jCnHt8VDmmsvnqvBuLLzNtBt2htLCH1RiiNE+8uM1nCJI6gPh
wpj5sdkQDaNmCzMn5ZPnjr7OFyUSAu8833Fr+RN2lW4nBEfECcNi3gZt2j9cSE//
v0/PtRFy6ZTe7DRAeqzs+so=
-----END PRIVATE KEY-----
    `;
    this.myClientCertificate = `
-----BEGIN CERTIFICATE-----
MIIDHzCCAgcCFFTyIJfD9baCGot7vWYcLrDdUyQbMA0GCSqGSIb3DQEBCwUAMEUx
CzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRl
cm5ldCBXaWRnaXRzIFB0eSBMdGQwHhcNMjIwNjIwMjE1NzE3WhcNMjMxMTAyMjE1
NzE3WjBTMQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UE
CgwYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMQwwCgYDVQQDDANCb2IwggEiMA0G
CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQD0GnkrXmY8xWm6oIfbdAN2DYms6B5D
tJ1c7PBxRmKh6a7KUbUct+0CAyxcz5VgJdYHe9eHYCR10qdwONWQbREdh+XER8ec
V0MliUHUB0vbCttv/TY5wK0EL9eoS1Xew+JX/8c/uceDtBnJO33bfxdveOLhl023
l6nb2kZxSVipPWU/X4LWRDRW7m1uqul55D3VJyxaauLtL7qLrm04kT9ACu1W3dhn
NbvKGsqFQwP8iALaGvugR0zpCzzyK0bhPlzO6b+A2QTZ83KEA/WkRzEk4H+Skdjk
CPu/FImTZmlOXMKGUjSLzonXsZTExH/9T8HkbvE/9BuoULU/ukq+zU6VAgMBAAEw
DQYJKoZIhvcNAQELBQADggEBAECMJIxjNLzOmIGJb8vm87gfRO/suUsnaPumJqTx
POIwZuMUk1V7nkvpGroRq6rNrD20J7r+q20ZmQ4fAbeIjA1bFOivKMzPEjyvgOhm
RCj0oa4BnXzfH4sGX8i+qPV1Z6jyHN3/qJbF6L1ehLPYzesumY9tfQPAKHdKDrzY
ngud0JwUFjdT0OciO0PuILmTHOdOMoFfAxhOy7kiwOcpdVXdihhI9Rcws/eoQiPw
ypBuHmt5NNnFodvQujFmLgxvl6M04JI8WbKlQwzTKr4ASRmr5sb6csnXhnh9Q4YC
KUlD6tnIneakwPv4SkxxIhodXvpk5HGeXmYvBsN32FlyDNY=
-----END CERTIFICATE-----
    `;
    console.log(this.myClientCertificate);
    const vm = this;

    // create TLS client
    this.client = forge.tls.createConnection({
      server: false,
      caStore: [caAuthority],
      sessionCache: {},
      // supported cipher suites in order of preference
      cipherSuites: [
        forge.tls.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA,
        forge.tls.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA],
      virtualHost: 'localhost',
      verify: function verif(connection, verified, depth, certs) {
        const cn = certs[0].subject.getField('CN').value;
        let newVerified = null;
        if (depth === 0) {
          if (cn !== 'Alice') {
            console.log('cn is: ', cn);
            newVerified = {
              alert: forge.tls.Alert.Description.bad_certificate,
              message: 'Certificate common name does not match hostname.',
            };
            return newVerified;
          }
        }
        return verified;
      },
      connected: function connect(connection) {
        console.log('connected');
        // send message to server
        connection.prepare(forge.util.encodeUtf8('Hi server!'));
      },
      getCertificate: function getCert(connection, hint) {
        console.assert(connection, hint);
        console.log(vm.myClientCertificate);
        return vm.myClientCertificate;
      },
      /* the private key for the client-side cert if provided */
      getPrivateKey: function getKey(connection, cert) {
        console.assert(connection, cert);
        console.log('Private key');
        return (vm.myClientPrivKey);
      },
      tlsDataReady: function tlsDataReady(connection) {
        // TLS data (encrypted) is ready to be sent to the server
        // if you were communicating with the server below above you'd do:
        const bytes = connection.tlsData.getBytes();
        console.log('Sending data to TLS server: ', bytes);
        vm.server.process(bytes);
        // In real app were going to send it to routing server
      },
      dataReady: function dataReady(connection) {
        // clear data from the server is ready
        const message = forge.util.decodeUtf8(connection.data.getBytes());
        console.log('the server sent: ', message);
        vm.processDataFromTlsServer(message);
        // close connection
        // connection.close();
      },
      closed: function closed() {
        console.log('disconnected');
      },
      error: function errorTLS(connection, error) {
        console.assert(connection);
        console.log('uh oh', error);
      },
    });

    // Generate a certificate for server
    this.myServerPrivKey = `
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD5LwKbcOyqQYqK
CNy+yHey1SovmzHlovpnebdjrGHbvuQhiIlabA1XFZGu4cSKdZPJqw9cnfFr38NB
KUzL0UhulirHb0HSdlxdwKCR0trXMup0CduIMaZtrBKVzZwT+ntTMIyO2xlqICmc
45wwJBEf4uORL++vToQr+oubFYWStzIc+9juPJimdtXa1bR74GKuEOMO8liQeZHR
3bayT2eaYntTe7Ncbq27ICXf4QagxnBsEarGGq5lBdUkgo8C0/YRibngGSdV+S5g
cei0DK4XgfuQzJ+DoiEubDmWVrcncVs0nU+xWotWRV/udL5vud4f+yVQRBeZvEu6
aU7tlqA5AgMBAAECggEAaaqcsWvGgEBAzl4JtcFuuOAZ/owSMa3V/7Emqla8PKIL
PYkXrcdqNMaJu54zaP+JBxjJ791uNe9ybhxkW33I+FQnmeC9CdF1Q7BeptfCQ0Vt
FH3loTBkwdcZHntNN0+dol5RDHcupMk0vDnszqFMvbfKBpRMUIu8EqYxMzeCJ/8/
RObN3sgIfgO/zmBxGA3OzHl0bA5yqrDuuwQnp4PjcUNWwhK1o8XIRTRlf/Z2S0OL
o/ad1EBAfrU4j6NPfUMYndhrk/rO/FGSqpCdLFDAJs2Ec6iKdO88IrN8w19YTKYa
uSISulIt4341k7HmmtSP0oEqNOL8chO9fJDaQrRIgQKBgQD83xWTxHSgwRq8AgW/
cyiUCW9JdZ1OX1JW26DGu3McIdORzIl7LAJNx2wgGfZKDj2MBtGABIns2mL8SMdQ
Fn3HTyismbALmgxg3UMYzMTu5XLnQyI0ijWYnC518cE0BCUOIxrec6jBsK/zTPP1
sNe/aO8+wbHWISgjwlFqET5ySQKBgQD8RD7g+Oe6O6IvQOkXYS2UPSVH7usi7IVs
pljEyIVm647dr7jAOMr1k4vVwkT9Wdtt2xL1VHi3TszSa7NxQAviBJLMxYlZbFAm
cwXqOxtOQ+ekXLoMhfMyi2jjhDHrVvizxDnYzbWxBJnAzrfubHJurjG55gZM9RJu
1yiftpS+cQKBgA9ZUyv2/sVLM146GTM3wDzMHc8trnC1ZIAVMLsfYatRelAdRDMP
xswF0NBaAxMXrjCzsT++BskzsFJz8HUyCExyx5tCcOcjYKD4jTwSIdoGX2UeNBNQ
WFR9FmzeUcXggodLJjRefN3U5bk08JH3PAFIU01R4IOI27Df+KUhitLRAoGBAIRy
rHTgGoJsFu4qbXdp/U1MgUtwRKJ0fmUaPZcsFOaBnOQGA8Fg0Cb5zbxwoFpImG3o
TN7j9/F+fQmppHA8iUCk2BKNUFzUAoz9bUiaue5wtqlUShaTKaoLCgoSeUcvxapU
x25uKwwC91sE7gtPgxFbgh4xiHNVZNUvQFQCv7vxAoGAKWt+5bHk80LqujEUDKPJ
l1D1JqUt+Dh91mfwaEO19/GFqMLC4AzZ2yVjJ95No5Mjq9U8vBi/WngbMKHzRPDM
2YmhgPPAGe/lKi4PhpsuO9xJ+NDrKgHmnM9gr8MZisUpM/Xso0p7Bc37j/dmjrhr
5HCa0dO9ZrUCe5cf6AnzoDo=
-----END PRIVATE KEY-----
    `;
    this.myServerCertificate = `
-----BEGIN CERTIFICATE-----
MIIDITCCAgkCFFTyIJfD9baCGot7vWYcLrDdUyQcMA0GCSqGSIb3DQEBCwUAMEUx
CzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRl
cm5ldCBXaWRnaXRzIFB0eSBMdGQwHhcNMjIwNjIwMjIwMDU1WhcNMjMxMTAyMjIw
MDU1WjBVMQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UE
CgwYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMQ4wDAYDVQQDDAVBbGljZTCCASIw
DQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAPkvAptw7KpBiooI3L7Id7LVKi+b
MeWi+md5t2OsYdu+5CGIiVpsDVcVka7hxIp1k8mrD1yd8Wvfw0EpTMvRSG6WKsdv
QdJ2XF3AoJHS2tcy6nQJ24gxpm2sEpXNnBP6e1MwjI7bGWogKZzjnDAkER/i45Ev
769OhCv6i5sVhZK3Mhz72O48mKZ21drVtHvgYq4Q4w7yWJB5kdHdtrJPZ5pie1N7
s1xurbsgJd/hBqDGcGwRqsYarmUF1SSCjwLT9hGJueAZJ1X5LmBx6LQMrheB+5DM
n4OiIS5sOZZWtydxWzSdT7Fai1ZFX+50vm+53h/7JVBEF5m8S7ppTu2WoDkCAwEA
ATANBgkqhkiG9w0BAQsFAAOCAQEAhaD5SBKNjbvhre0ddhcIuw5JRU6BhGzciv6g
OzUIZOqyZXRi62QDvvSgxlBozseOEtsE95Rnf8YZzalW5Kplr2v4F63mx75X23wE
/EU3bag5WcdD5ZQqmQK8a8n6lPRD31SOa7tw/DFSJSaXGw/KnBH0bW6TMJ8Bm9J+
sm33KjWJaifuRgtGqkSWvNXWRVkC6ZQ2OhSdbRiGRvsZk7yKjW1L5MVOXlHZIx6Q
ERJ6/bbnRz9ds/5ZqV0I1sMh/160S5NBCJyX5C+50VZzcmoIXoIQO1H9wtsrLKme
7i61aTHCY5Rn1lSKLpEAXO2vJRpWaz5NBFt1JzCpVv27hnFXVw==
-----END CERTIFICATE-----
    `;
    // forge.pki.certificateToPem(this.myServerCertificate);
    console.log(this.myServerCertificate);

    // create TLS server
    this.server = forge.tls.createConnection({
      server: true,
      caStore: [caAuthority],
      sessionCache: {},
      // supported cipher suites in order of preference
      cipherSuites: [
        forge.tls.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA,
        forge.tls.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA],
      // require a client-side certificate if you want
      verifyClient: true,
      verify: function verif(connection, verified, depth, certs) {
        const cn = certs[0].subject.getField('CN').value;
        let newVerified = '';
        if (depth === 0) {
          // cn is Common Name, we can also verify signature and stuff here
          if (cn !== 'Bob') {
            console.log('cn is: ', cn);
            newVerified = {
              alert: forge.tls.Alert.Description.bad_certificate,
              message: 'Certificate common name does not match expected client.',
            };
            return newVerified;
          }
          if (cn !== 'Bob') {
            console.log(certs[0].subject);
            const signature = certs[0].subject.getField('signature').value;
            console.log(signature);
          }
        }
        return verified;
      },
      connected: function conn(connection) {
        console.log('connected');
        // send message to client
        connection.prepare(forge.util.encodeUtf8('Hi client!'));
      },
      getCertificate: function getCert(_connection, _hint) {
        console.assert(_connection, _hint);
        console.log(vm.myServerCertificate);
        return vm.myServerCertificate;
      },
      getPrivateKey: function getKey(_connection, _cert) {
        console.assert(_connection, _cert);
        return (vm.myServerPrivKey);
      },
      tlsDataReady: function tlsDataReady(connection) {
        // TLS data (encrypted) is ready to be sent to the client
        // if you were communicating with the client above you'd do:
        const bytes = connection.tlsData.getBytes();
        console.log('Processing data from TLS server: ', bytes);
        vm.client.process(bytes);
        // In real app were going to send it to routing server here
      },
      dataReady: function dataReady(connection) {
        // clear data from the client is ready
        const message = (forge.util.decodeUtf8(connection.data.getBytes()));
        console.log('the client sent: ', message);
        // Respond with mirrored echo:
        this.prepare(forge.util.encodeUtf8(message + message));
        // close connection
        // connection.close();
      },
      closed: function closed() {
        console.log('disconnected');
      },
      error: function tlsError(connection, error) {
        console.log(connection);
        console.log('uh oh', error);
      },
    });
  },
};
</script>
