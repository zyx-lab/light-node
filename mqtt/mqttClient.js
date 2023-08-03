const mqtt = require('mqtt');
const { forEach } = require('lodash');
const Message = require('../models/messageModel');
const Seq = require('../utils/seq');
const {
  checkPayloadBcc,
  handleAck,
  lightError,
  lightClose,
} = require('./subscribeMqtt');
const { updateLightInfo } = require('./publishMqtt');

const options = {
  protocol: 'mqtt',
  port: 1883,
  host: '192.168.1.102',
  // host: 'localhost',
  clientId: 'node',
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
};
const { protocol, host, port } = options;

const connectUrl = `${protocol}://${host}:${port}`;

class MqttClient {
  constructor() {
    this.client = null;
  }

  connect() {
    this.client = mqtt.connect(connectUrl, options);

    this.client.on('connect', () => {
      console.log('连接成功');
      this.client.subscribe('/andon/dev/#', { qos: 2 }, (error) => {
        if (error) {
          console.error(error);
        }
      });
    });

    this.client.on('message', async (topic, payload) => {
      console.log('接收消息');
      const payloadHex = payload.toString('hex');
      const checkBCC = checkPayloadBcc(payloadHex);
      if (checkBCC || true) {
        const command = payloadHex.slice(4, 6);
        if (command === '21') handleAck(payloadHex);
        if (command === '22') lightError(payloadHex);
        if (command === '23') {
          const lightTopics = await lightClose(payloadHex);
          forEach(lightTopics, async (lights, responseTopic) => {
            try {
              const seq = Seq.get();
              await Message.findOneAndUpdate(
                { seq },
                {
                  seq,
                  type: 0,
                  status: 0,
                  $set: { lightIds: lights },
                },
                { runValidators: true, upsert: true, new: true }
              );
              const message = updateLightInfo(
                seq,
                lights.length,
                0,
                '000000',
                0,
                lights
              );
              this.publishMessage(`/andon/${responseTopic}`, message);
            } catch (err) {
              console.error(err);
            }
          });
        }
      }
    });
  }

  publishMessage(topic, payload) {
    this.client.publish(topic, payload, { qos: 1 }, (error) => {
      if (error) {
        return console.error('发送失败', error);
      }
    });
  }
}

const mqttClient = new MqttClient();

module.exports = mqttClient;
