const request = require('superagent');
const xml2jsParser = require('superagent-xml2jsparser');
const { registerFeedbackXml, deregisterFeedback } = require('./utils');

class Codec {
  constructor({ username, password, ip }) {
    this.username = username;
    this.password = password;
    this.ip = ip;
  }

  async registerFeedback(url) {
    let res;
    try {
      res = await request.post(`http://${this.ip}/putxml`)
        .auth(this.username, this.password)
        .accept('json')
        .type('xml')
        .send(registerFeedbackXml(url))
      return res
    }
    catch (e) {
      console.error('Error in registering feedback')
      throw e
    }
  }

  async deregisterFeedback(url) {
    let res;
    try {
      res = await request.post(`http://${this.ip}/putxml`)
        .auth(this.username, this.password)
        .accept('json')
        .type('xml')
        .send(deregisterFeedbackXml(url))
      return res
    }
    catch (e) {
      console.error('Error in registering feedback')
      throw e
    }
  }

  async getStatus() {
    let res;
    try {
      res = await request.get(`http://${this.ip}/status.xml`)
        .auth(this.username, this.password)
        .accept('xml')
        .buffer(true)
        .parse(xml2jsParser)
      return res;
    }
    catch (e) {
      console.error('Error getting status')
      throw e
    }
  }
}

module.exports = {
  Codec
};