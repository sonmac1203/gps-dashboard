import { useState } from 'react';
import * as mqtt from 'mqtt';
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
} from 'reactstrap';
import styles from './App.module.css';

function App() {
  const brokerUrl = 'ws://192.168.0.107:8000';

  const [clients, setClients] = useState({});

  const autoMessages = [
    '43.661102,-79.391873',
    '43.660996,-79.391932',
    '43.660899,-79.391984',
    '43.660819,-79.392038',
    '43.660721,-79.392085',
    '43.660649,-79.392122',
    '43.660579,-79.392166',
    '43.660511,-79.392209',
    '43.660437,-79.392255',
    '43.660358,-79.392304',
  ];

  const FREQUENCY = 5000;

  const handleSubmit = (event) => {
    event.preventDefault();
    const clientName = event.target[0].value;
    const clientId = event.target[1].value;
    event.target[0].value = '';
    event.target[1].value = '';
    const newMqttClient = mqtt.connect(brokerUrl, {
      clientId: clientId,
    });
    newMqttClient.on('connect', () => {
      console.log(`${clientId} connected to broker`);
      window.alert(`${clientId} connected to broker`);
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

  const handleAuto = (clientId) => {
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      if (currentIndex < autoMessages.length) {
        const message = autoMessages[currentIndex];
        clients[clientId].clientHandle.publish(`gps/${clientId}`, message);
        currentIndex += 1;
      } else {
        clearInterval(intervalId);
      }
    }, FREQUENCY);
    return () => clearInterval(intervalId);
  };

  const onManualPublish = (e, clientId) => {
    e.preventDefault();
    const message = e.target[0].value;
    if (!message || message.length === 0) {
      return false;
    }
    clients[clientId].clientHandle.publish(
      `gps/${clientId}`,
      message,
      (err) => {
        if (err) {
          window.alert('Could not publish coordinates. Please try again!');
        } else {
          window.alert('Coordinates published successfully!');
        }
      }
    );
  };

  return (
    <div className='App'>
      <Container className='my-5'>
        <h1 className='mb-5'>Clients portal</h1>
        <section className={'mb-5 ' + styles.FormSection}>
          <h3>Connections</h3>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for='clientName'>Name</Label>
              <Input
                id='clientName'
                name='clientName'
                placeholder='Provide your name ...'
                type='text'
              />
            </FormGroup>
            <FormGroup>
              <Label for='clientId'>Cliend id</Label>
              <Input
                id='clientId'
                name='clientId'
                placeholder='Provide your client id ...'
                type='text'
              />
            </FormGroup>
            <Button className='mt-2' color='success'>
              Connect to broker
            </Button>
          </Form>
        </section>
        <Row>
          {Object.keys(clients).length > 0 &&
            Object.keys(clients).map((clientId, k) => (
              <Col md='6' sm='12' key={k}>
                <Card className='my-2'>
                  <CardHeader>{clients[clientId].name}</CardHeader>
                  <CardBody>
                    <CardTitle tag='h5' className='mb-4'>
                      Id: {clientId}
                    </CardTitle>
                    <Form
                      onSubmit={(e) => {
                        onManualPublish(e, clientId);
                      }}
                    >
                      <FormGroup>
                        <Input
                          id='message'
                          name='message'
                          placeholder='Provide your coordinates ...'
                          type='text'
                        />
                      </FormGroup>
                      <Button type='submit' className='mt-2' color='primary'>
                        Send coordinates
                      </Button>
                      <Button
                        className='mt-2 ms-3'
                        color='link'
                        onClick={() => {
                          handleAuto(clientId);
                        }}
                      >
                        Auto-generated
                      </Button>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            ))}
        </Row>
      </Container>
    </div>
  );
}

export default App;
