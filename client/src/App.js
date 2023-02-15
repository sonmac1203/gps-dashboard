import { useState } from 'react';
import * as mqtt from 'mqtt';

function App() {
  const brokerUrl = 'ws://192.168.0.107:8000';

  const [clients, setClients] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const clientName = event.target[0].value;
    const clientId = event.target[0].value;
    event.target[0].value = '';
    event.target[1].value = '';
    const newMqttClient = mqtt.connect(brokerUrl, {
      clientId: clientId,
    });
    newMqttClient.on('connect', () => {
      console.log(`${clientId} connected to broker`);
    });
    setClients({
      ...clients,
      [clientId]: {
        id: clientId,
        name: clientName,
        clientHandle: newMqttClient,
      },
    });
  };
  return (
    <div className='App'>
      <form onSubmit={handleSubmit}>
        <label htmlFor='fname'>Name:</label>
        <input type='text' id='name' name='fname' />
        <label htmlFor='fname'>Client Id:</label>
        <input type='text' id='fname' name='fname' />
        <input type='submit' value='Submit' />
      </form>
      <div>
        {Object.keys(clients).length > 0 &&
          Object.keys(clients).map((clientId, k) => (
            <div key={k}>
              <h3>
                Name: {clients[clientId].name} <br />
              </h3>
              <h4>Id: {clientId}</h4>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const message = event.target[0].value;
                  clients[clientId].clientHandle.publish(
                    `gps/${clientId}`,
                    message
                  );
                }}
              >
                <label htmlFor='fname'>Message:</label>
                <input type='text' id='message' name='message' />
                <input type='submit' value='Submit' />
              </form>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
