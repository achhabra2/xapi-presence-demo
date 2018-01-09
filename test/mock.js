const { mockConnect } = require('../src/xapi');

const xapi = mockConnect('test');
console.log('Setting Presence / PeopleCount to ON...');
xapi.config.set('RoomAnalytics PeoplePresenceDetector', 'On');
xapi.config.set('RoomAnalytics PeopleCountOutOfCall', 'On');


let count = xapi.status.get('RoomAnalytics PeopleCount Current');
let presence = xapi.status.get('RoomAnalytics PeoplePresence');

console.log(`${presence} & ${count}`);

xapi.status.on('RoomAnalytics', data => {
  console.log(`Received Event Data: ${JSON.stringify(data)}`)
});