const { connect } = require('@cesw/jsxapi');
const { connect } = require('@cesw/jsxapi');
const request = require('superagent');
const { mockConnect } = require('./xapi');
/**
 * Class wrapper for Cisco TP Codec
 * Convenience Methods for using xAPI
 * @class Codec
 */
class Codec {
  /**
   * Creates an instance of Codec.
   * @param {object} codec
   * @param {string} codec.name
   * @param {string} codec.username
   * @param {string} codec.macAddress
   * @param {string} codec.password
   * @param {string} codec.ip
   * @param {object} [codec.io]
   * @param {string} [codec.feedbackUrl]
   * @memberof Codec
   */
  constructor(codec) {
    const { name, username, macAddress, password, ip, io, feedbackUrl } = codec;
    this.name = name;
    this.username = username;
    this.password = password;
    this.ip = ip;
    this.macAddress = macAddress;
    io && (this.io = io);
    feedbackUrl && (this.feedbackUrl = feedbackUrl);
    if (macAddress === 'DEMO') {
      this.xapi = mockConnect();
    }
    else {
      this.xapi = connect(this.ip, {
        username: this.username,
        password: this.password,
      });
    }
  }

  /**
   * Initializes Codec and sets PeopleCount and Presence Detector to ON
   * Also Registers feedback
   * @memberof Codec
   */
  async init() {
    // Set a configuration
    console.log('Setting Presence / PeopleCount to ON...');
    this.xapi.config.set('RoomAnalytics PeoplePresenceDetector', 'On');
    this.xapi.config.set('RoomAnalytics PeopleCountOutOfCall', 'On');
    // try {
    //   const address = await this.xapi.status
    //     .get('Ethernet MacAddress')
    //   this.mac = address;
    //   console.log(`Found MAC for codec ${this.name}: ${this.mac}`);
    // }
    // catch (e) {
    //   console.log(`Could not get MAC Address for codec ${this.name}`);
    // }
    this.registerFeedback(this.io);
    try {
      const status = await this.getStatus();
      this.lastPresence = status[1];
      this.lastCount = status[0];
    }
    catch (e) {
      console.error('Could not fetch initial status');
    }
  }

  /**
   *
   *
   * @param {object} io // Socket.io instance
   * @memberof Codec
   */
  registerFeedback(io) {
    this.presenceFeedback = this.xapi.status.on('RoomAnalytics', async (event) => {
      const payload = {
        codec: this.name,
        ip: this.ip,
        macAddress: this.macAddress
      };
      if (event.hasOwnProperty('PeoplePresence')) {
        payload.type = 'PeoplePresence';
        payload.data = event.PeoplePresence;
      }
      else if (event.hasOwnProperty('PeopleCount')) {
        payload.type = 'PeopleCount'
        payload.data = event.PeopleCount.Current;
      }
      console.log(`Emitting Event: ${JSON.stringify(payload)}`);
      io.sockets.emit(payload.type, payload);
      if (this.feedbackUrl) {
        try {
          console.log(`Sending POST Feedback to URL: ${this.feedbackUrl}`);
          await request.post(this.feedbackUrl)
            .send(payload)
        }
        catch (e) {
          console.log(`Error sending feedback ${e}`);
        }
      }
    });

    this.pairingFeedback = this.xapi.feedback.on('Status/spark/paireddevice/userid', async (personid) => {
      try {
// NOTE: not sure how you want to set the url in your constructor, so I'm going to let you
// set this yourself. Needs to go to https://cl-proxbot.herokuapp.com/sendto
        console.log(`Sending POST Feedback to URL: ${this.feedbackUrl}`);
        await request.post(this.feedbackUrl)
          .send({personId: personid})
      }
      catch (e) {
        console.log(`Error sending feedback ${e}`);
      }
    });
  }

  /**
   *
   *
   * @returns
   * @memberof Codec
   */
  deregisterFeedback() {
    return this.presenceFeedback();
  }

  /**
   *
   *
   * @returns {Promise} //
   * @memberof Codec
   */
  async getStatus() {
    let count = this.xapi.status
      .get('RoomAnalytics PeopleCount Current')
    let presence = this.xapi.status
      .get('RoomAnalytics PeoplePresence')
    return Promise.all([count, presence]);
  }

  toJSON(key) {
    return {
      name: this.name,
      ip: this.ip,
      macAddress: this.macAddress,
      lastPresence: this.lastPresence,
      lastCount: this.lastCount
    }
  }
}


module.exports = {
  Codec
};