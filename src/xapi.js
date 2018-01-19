const EventEmitter = require('events');

exports.mockConnect = connect;

function connect() {
  const api = new xapi();
  api.status.start();
  return api;
}

class xapi {
  constructor() {
    this.config = {
      set(string) {
        // do nothing
      }
    }
    this.status = new status()
  }
}

class status extends EventEmitter {

  static countEvent() {
    return {
      PeopleCount: {
        Current: Math.floor(Math.random() * 10) - 1
      }
    }
  }

  static presenceEvent() {
    let value = Math.round(Math.random());
    let presence;
    (value === 0) ? presence = "NO" : presence = "YES";
    return {
      PeoplePresence: presence
    }
  }

  start() {
    this.countInterval = setInterval(() => {
      this.emit('RoomAnalytics', status.countEvent())
    }, 10000 * Math.random() + 1000)
    this.presenceInterval = setInterval(() => {
      this.emit('RoomAnalytics', status.presenceEvent())
    }, 15000 * Math.random() + 1000)
  }

  stop() {
    clearInterval(this.countInterval);
    clearInterval(this.presenceInterval);
  }

  get(string) {
    switch (string) {
      case 'RoomAnalytics PeopleCount Current':
        return 1;
      case 'RoomAnalytics PeoplePresence':
        return "YES";
      default:
        break;
    }
  }
}