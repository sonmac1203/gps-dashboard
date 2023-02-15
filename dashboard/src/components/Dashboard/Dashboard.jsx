import React, { useState, useEffect } from 'react';
import * as mqtt from 'mqtt';
// import client from '../../mqttClient';

export const Dashboard = () => {
  const [clients, setClients] = useState({});

  // Define the MQTT broker's URL and port
  const brokerUrl = 'ws://192.168.0.107:8000';

  // Define the topic for GPS location data
  const gpsTopic = 'gps/+';

  const options = {
    clientId: 'admin',
  };

  useEffect(() => {
    const client = mqtt.connect(brokerUrl, options);
    client.on('connect', () => {
      console.log('connected');
      client.subscribe(gpsTopic);
    });

    client.on('message', (topic, message) => {
      console.log(`Received message on topic ${topic}: ${message.toString()}`);

      const clientId = topic.split('/')[1];
      const receivedMessage = message.toString();

      setClients((currentClients) => {
        if (currentClients.hasOwnProperty(clientId)) {
          const updatedMessages = [
            ...currentClients[clientId],
            receivedMessage,
          ];
          return { ...currentClients, [clientId]: updatedMessages };
        } else {
          return { ...currentClients, [clientId]: [receivedMessage] };
        }
      });
    });
    return () => {
      client.end();
    };
  }, []);

  return (
    <div>
      <h3>Chasgagsa</h3>
      <h4>HIHI</h4>
      <h2>This is the message</h2>
      {Object.keys(clients).length > 0 &&
        Object.keys(clients).map((clientId, key) => (
          <div key={key}>
            <h3>{clientId}</h3>
            <p>{clients[clientId].map((message) => `${message}, `)}</p>
          </div>
        ))}
    </div>
  );
};
