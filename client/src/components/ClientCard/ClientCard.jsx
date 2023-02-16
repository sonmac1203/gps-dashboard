import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Input,
  Button,
} from 'reactstrap';

export const ClientCard = ({
  clientName,
  clientId,
  onManualPublish,
  onAutoPublish,
}) => {
  return (
    <Card className='my-2'>
      <CardHeader>{clientName}</CardHeader>
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
              onAutoPublish(clientId);
            }}
          >
            Auto-generated
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};
