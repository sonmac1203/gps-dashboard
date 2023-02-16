import React from 'react';
import { Badge } from 'reactstrap';

export const SectionHeader = ({ brokerConnected, text }) => {
  return (
    <div className='d-flex align-items-center mb-3 gap-3'>
      <h3>{text}</h3>
      <Badge color={brokerConnected ? 'danger' : 'secondary'}>
        {brokerConnected ? 'Live' : 'Disconnected'}
      </Badge>
    </div>
  );
};
