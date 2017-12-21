'use strict'

const { Codec } = require('./src/sparkCodec');
const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const codecsList = require('./codecs.json');

server.listen(3003);

app.use('/', express.static(path.join(__dirname, 'public')))


app.post('/codecs', (req, res) => {

})

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
});

const codecs = codecsList.map(codec => new Codec({ io, ...codec }));

for (const codec of codecs) {
  codec.init();
  console.log(`Current Status of codec ${codec.name}: `);
  codec.getStatus().then(result => console.log(`PeopleCount: ${result[0]}, Presence: ${result[1]}`));
}

process.on('SIGINT', async () => {
  console.log('Received SIGINT.  Press Control-D to exit.');
  try {
    for (const codec of codecs) {
      await codec.deregisterFeedback();
    }
    process.exit();
  }
  catch (e) {
    console.error(`Could not stop feedback: ${e}`);
    process.exit();
  }
});