import * as mqtt from 'mqtt';

// Define the MQTT broker's URL and port
const brokerUrl = 'ws://192.168.0.107:8884';

// Define the topic for GPS location data
const gpsTopic = 'gps';

const options = {
  clientId: 'anhdang',
};

const client = mqtt.connect(brokerUrl, options);
client.subscribe(gpsTopic);

export default client;
