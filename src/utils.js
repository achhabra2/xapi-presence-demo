const js2xml = require('js2xmlparser');

const registerFeedbackXml = (url) => {
  let json = {
    HttpFeedback: {
      Register: {
        "@": {
          command: 'True'
        },
        FeedbackSlot: {
          '#': '2'
        },
        ServerUrl: {
          '#': url
        },
        Format: {
          '#': 'JSON'
        },
        Expression: {
          '@': {
            item: '1'
          },
          '#': '/Status/RoomAnalytics'
        }
      }
    }
  }
  return js2xml.parse("Command", json);
};

const deregisterFeedbackXml = (url) => {
  let json = {
    HttpFeedback: {
      Deregister: {
        "@": {
          command: 'True'
        },
        FeedbackSlot: {
          '#': '2'
        }
      }
    }
  }
  return js2xml.parse("Command", json);
};

module.exports = {
  registerFeedbackXml,
  deregisterFeedbackXml
}