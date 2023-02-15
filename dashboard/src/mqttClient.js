import * as mqtt from 'mqtt';

// Define the MQTT broker's URL and port
const brokerUrl = 'ws://192.168.0.107:8000';

// Define the topic for GPS location data
const gpsTopic = 'gps/+';

const options = {
  clientId: 'admin',
};

const client = mqtt.connect(brokerUrl, options);
client.subscribe(gpsTopic);

export default client;
