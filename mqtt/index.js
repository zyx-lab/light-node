const mqtt = require('mqtt');
const { receivingMessage } = require('./subsribe');

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

client.on('connect', () => {
  client.subscribe('/light/dev', { qos: 2 }, (error) => {
    if (error) {
      console.error(error);
    }
  });
});

client.on('message', (topic, payload) => {
  receivingMessage(topic, payload);
});

module.exports = client;
