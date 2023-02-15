import React, { useState } from 'react';
import client from '../../mqttClient';

export const Dashboard = () => {
  const [message, setMessage] = useState('');

  client.on('message', (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
    setMessage(message.toString());
    // Do something with the received message
  });

  return (
    <div>
      <h3>Chasgagsa</h3>
      <h4>HIHI</h4>
      <h2>This is the message: {message}</h2>
    </div>
  );
};
