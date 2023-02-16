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
        <Col lg='8' md='12'>
          <section>
            <div className='d-flex align-items-center mb-4 gap-3'>
              <h2>Connected clients</h2>
              <Badge color={brokerConnected ? 'danger' : 'secondary'}>
                {brokerConnected ? 'Live' : 'Disconnected'}
              </Badge>
            </div>
            {Object.keys(clientsConnected).length === 0 ? (
              <h5>No client has been connected</h5>
            ) : (
              <Table>
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
        <Col lg='4' md='12'>
          <section>
            <h2 className='mb-4'> Details</h2>
            {!clickedClientId ? (
              <h5>Click on a client to see details</h5>
            ) : (
              <>
                <div>
                  <h3 className='mt-4'>Recent records</h3>
                  <Table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Date</th>
                        <th>Lat</th>
                        <th>Long</th>
                      </tr>
                    </thead>
                    <tbody>
                      {secondaryTableData &&
                        secondaryTableData.map((data, id) => {
                          const message = data;
                          const [lat, long] = getMostRecentCoords(message);
                          const { date, time } = getMomentDateAndTime();

                          return (
                            <tr key={id}>
                              <th scope='row'>{time}</th>
                              <td>{date}</td>
                              <td>{lat}</td>
                              <td>{long}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                </div>
                <div>
                  <h3>Distances</h3>
                  <Table>
                    <thead>
                      <tr>
                        <th>To #</th>
                        <th>Distance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope='row'>1</th>
                        <td>Mark</td>
                      </tr>
                      <tr>
                        <th scope='row'>2</th>
                        <td>Jacob</td>
                      </tr>
                      <tr>
                        <th scope='row'>3</th>
                        <td>Larry</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </>
            )}
          </section>
        </Col>
      </Row>
    </Container>
  );
};

const getMostRecentCoords = (message) => {
  return message ? message.split(',') : ['--.--', '--.--'];
};

const getFormattedDate = (timestamp) => {};

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
