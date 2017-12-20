const { connect } = require('@cesw/jsxapi');

class Codec {
  constructor({ name, username, password, ip, io }) {
    this.name = name;
    this.username = username;
    this.password = password;
    this.ip = ip;
    this.io = io;
    this.xapi = connect(this.ip, {
      username: this.username,
      password: this.password,
    });
  }

  init() {
    // Set a configuration
    console.log('Setting Presence / PeopleCount to ON...');
    this.xapi.config.set('RoomAnalytics PeoplePresenceDetector', 'On');
    this.xapi.config.set('RoomAnalytics PeopleCountOutOfCall', 'On');
    return this.registerFeedback(this.io)
  }

  registerFeedback(io) {
    this.presenceFeedback = this.xapi.status.on('RoomAnalytics', (event) => {
      console.log(`Event triggered: ${JSON.stringify(event)}`);
      io.sockets.emit('Event Triggered', event);
    });
  }

  deregisterFeedback(url) {
    return this.presenceFeedback();
  }

  async getStatus() {
    let count = this.xapi.status
      .get('RoomAnalytics PeopleCount Current')
    let presence = this.xapi.status
    .get('RoomAnalytics PeoplePresence')
    return Promise.all([count, presence]);
  }
}

module.exports = {
  Codec
};