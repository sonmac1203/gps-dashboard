import React, { useState, useEffect } from 'react';
import * as mqtt from 'mqtt';
import { Container, Row, Col, Table, Badge } from 'reactstrap';
import styles from './Dashboard.module.css';
// import client from '../../mqttClient';

export const Dashboard = () => {
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [clientsConnected, setClientsConnected] = useState({});
  const MAX_QUEUE_LENGTH = 4;

  const [clickedClientId, setClickedClientId] = useState();
  const [secondaryTableData, setSecondaryTableData] = useState();

  const [clientDistances, setClientDistances] = useState({});

  // Define the MQTT broker's URL and port
  const brokerUrl = 'ws://192.168.0.107:8000';

  // Define the topic for GPS location data
  const gpsTopic = 'gps/+';

  const options = {
    clientId: 'admin',
  };

  const defaultDateAndTime = {
    date: '---',
    time: '---',
  };

  useEffect(() => {
    if (clickedClientId) {
      const clientData = clientsConnected[clickedClientId];
      setSecondaryTableData(clientData.messageQueue.slice(1, MAX_QUEUE_LENGTH));
    }
  }, [clientsConnected, clickedClientId]);

  useEffect(() => {
    if (!clickedClientId || !clientsConnected[clickedClientId]) {
      setClientDistances({});
      return;
    }

    const [selectedClientLat, selectedClientLong] = getMostRecentCoords(
      clientsConnected[clickedClientId].messageQueue[0]
    );
    const distances = {};
    Object.keys(clientsConnected).forEach((clientId) => {
      if (clientId !== clickedClientId) {
        const message = clientsConnected[clientId].messageQueue[0];
        const [clientLat, clientLong] = getMostRecentCoords(message);
        const distance = message
          ? calculateDistance(
              selectedClientLat,
              selectedClientLong,
              clientLat,
              clientLong
            )
          : '---';
        distances[clientId] = distance;
      }
    });
    setClientDistances(distances);
  }, [clickedClientId, clientsConnected]);

  useEffect(() => {
    const client = mqtt.connect(brokerUrl, options);

    client.on('connect', () => {
      console.log('connected');
      setBrokerConnected(true);
      client.subscribe(gpsTopic);
    });

    client.on('disconnect', () => {
      setBrokerConnected(false);
    });

    client.on('message', (topic, message) => {
      const clientId = topic.split('/')[1];
      const receivedMessage = message.toString();

      if (
        receivedMessage === 'Connected' ||
        receivedMessage === 'Disconnected'
      ) {
        const connected = receivedMessage === 'Connected';
        setClientsConnected((currentClients) => {
          const updatedValue = {
            ...currentClients[clientId],
            connected: connected,
          };
          return {
            ...currentClients,
            [clientId]: currentClients.hasOwnProperty(clientId)
              ? updatedValue
              : { connected: true, messageQueue: [] },
          };
        });
      } else {
        setClientsConnected((currentClients) => {
          const messageQueue = currentClients[clientId].messageQueue;
          const updatedValue = {
            ...currentClients[clientId],
            messageQueue: [receivedMessage, ...messageQueue].slice(
              0,
              MAX_QUEUE_LENGTH
            ),
          };
          return { ...currentClients, [clientId]: updatedValue };
        });
      }
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <Container className='mt-5'>
      <h1 className='mb-5'>GPS Dashboard</h1>
      <Row>
        <Col lg='8' md='12' className='d-flex flex-column align-self-stretch'>
          <section className={styles.Section + ' ' + styles.Primary}>
            <div className='d-flex align-items-center mb-3 gap-3'>
              <h3>Connected clients</h3>
              <Badge color={brokerConnected ? 'danger' : 'secondary'}>
                {brokerConnected ? 'Live' : 'Disconnected'}
              </Badge>
            </div>
            {Object.keys(clientsConnected).length === 0 ? (
              <h5>No client has been connected</h5>
            ) : (
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Client id</th>
                    <th>Status</th>
                    <th>Lat</th>
                    <th>Long</th>
                    <th>Time</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(clientsConnected).map((clientId, k) => {
                    const [lat, long] = getMostRecentCoords(
                      clientsConnected[clientId].messageQueue[0]
                    );
                    const { date, time } =
                      clientsConnected[clientId].messageQueue.length > 0
                        ? getMomentDateAndTime()
                        : defaultDateAndTime;
                    return (
                      <tr
                        key={k}
                        className={styles.PrimaryTableRow}
                        onClick={() => {
                          setClickedClientId(clientId);
                        }}
                      >
                        <td scope='row'>{k + 1}</td>
                        <td>{clientId}</td>
                        <td>
                          {clientsConnected[clientId].connected ? (
                            <Badge color='success'>Online</Badge>
                          ) : (
                            <Badge color='secondary'>Offline</Badge>
                          )}
                        </td>
                        <td>{lat}</td>
                        <td>{long}</td>
                        <td>{time}</td>
                        <td>{date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </section>
        </Col>
        <Col lg='4' md='12' className='d-flex flex-column'>
          {clickedClientId && (
            <>
              <section className={'mb-4 ' + styles.Section}>
                <div className='d-flex align-items-center mb-3 gap-3'>
                  <h3>Other records</h3>
                  <Badge color={brokerConnected ? 'danger' : 'secondary'}>
                    {brokerConnected ? 'Live' : 'Disconnected'}
                  </Badge>
                </div>
                {secondaryTableData && secondaryTableData.length > 0 ? (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Date</th>
                        <th>Lat</th>
                        <th>Long</th>
                      </tr>
                    </thead>
                    <tbody>
                      {secondaryTableData.map((data, id) => {
                        const message = data;
                        const [lat, long] = getMostRecentCoords(message);
                        const { date, time } = getMomentDateAndTime();

                        return (
                          <tr key={id}>
                            <td>{time}</td>
                            <td>{date}</td>
                            <td>{lat}</td>
                            <td>{long}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                ) : (
                  <h5>No other record</h5>
                )}
              </section>
              <section className={styles.Section}>
                <div className='d-flex align-items-center mb-3 gap-3'>
                  <h3>Distances</h3>
                  <Badge color={brokerConnected ? 'danger' : 'secondary'}>
                    {brokerConnected ? 'Live' : 'Disconnected'}
                  </Badge>
                </div>
                {Object.keys(clientDistances).length === 0 ? (
                  <h5>No other client connected</h5>
                ) : (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>To #</th>
                        <th>Distance (km)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(clientDistances).map((clientId, key) => (
                        <tr key={key}>
                          <td>{clientId}</td>
                          <td>{clientDistances[clientId]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </section>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

const getMostRecentCoords = (message) => {
  return message ? message.split(',') : ['--.--', '--.--'];
};

const getMomentDateAndTime = () => {
  const timestamp = new Date();
  const date = timestamp.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const time = timestamp.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  return { date, time };
};

// Define a function to calculate the great-circle distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d.toFixed(10);
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
