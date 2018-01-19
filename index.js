'use strict'

const { Codec } = require('./src/sparkCodec');
const express = require('express');
const path = require('path');
const app = express();
const _ = require('lodash');
const fs = require('fs');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const codecsList = require('./codecs.json');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
server.listen(3003);

app.use('/', express.static(path.join(__dirname, 'public')));


app.post('/codecs', (req, res) => {
  if (Array.isArray(req.body)) {
    const properties = ['name', 'ip', 'username', 'password', 'macAddress'];
    let valid = true;
    for (const codec of req.body) {
      if (valid === false) {
        break;
      }
      for (const property of properties) {
        if (!codec.hasOwnProperty(property)) {
          valid = false;
          break;
        }
      }
    }
    if (valid) {
      console.log('Valid input accepted, writing JSON');
      const json = JSON.stringify(req.body);
      fs.writeFile('./codecs.json', json, 'utf8', async (err) => {
        if (err)
          res.status(500).send('Could not write JSON file.');
        await stop();
        start(req.body);
        res.status(200).send('Successful service restart. ');
      });
    }
    else {
      const error = 'Invalid input check JSON fields.';
      console.log(error);
      res.status(400).send(error);
    }
  }
  else {
    const error = 'JSON Received is not an array.';
    console.log(error);
    res.status(400).send(error);
  }
});

io.on('connection', function (socket) {
  socket.emit('hello', { world: true });
  socket.on('getCodecs', () => {
    console.log('Sending Codecs');
    io.emit('codecs', _.keyBy(codecs, 'ip'));
  });
});


process.on('SIGINT', async () => {
  console.log('Received SIGINT.  Press Control-D to exit.');
  await stop();
  process.exit();
});

let codecs = [];

function start(listJSON) {
  codecs = listJSON.map(codec => new Codec({ io, ...codec }));

  for (const codec of codecs) {
    codec.init();
    console.log(`Current Status of codec ${codec.name}: `);
    codec.getStatus().then(result => console.log(`PeopleCount: ${result[0]}, Presence: ${result[1]}`));
  }
}

async function stop() {
  try {
    for (const codec of codecs) {
      await codec.deregisterFeedback();
    }
  }
  catch (e) {
    console.error(`Could not stop feedback: ${e}`);
  }
}

start(codecsList);