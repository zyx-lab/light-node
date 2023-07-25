const mqtt = require('mqtt');

const protocol = 'mqtt';
const port = 1883;
const host = 'localhost';

const clientId = 'node';

const options = {
  protocol: 'mqtt',
  port: 1883,
  host: 'broker.emqx.io',
  clientId,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
};
const connectUrl = `${protocol}://${host}:${port}`;

const client = mqtt.connect(connectUrl, options);

// client.on('connect', () => {
//   console.log(`${protocol}: Connected`);
//   client.publish('/light/node9', 'test', { qos: 2 }, (error) => {
//     if (error) {
//       console.error(error);
//     }
//   });
// });

module.exports = client;
