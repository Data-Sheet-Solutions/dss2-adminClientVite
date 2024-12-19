import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/pro-solid-svg-icons';

const ManMatch = ({ group }) => {
  //count the total number of datasheetHashes that appear in all variants of the group and set to a constant
  const totalDatasheetHashes = group.variants.reduce((acc, variant) => acc + variant.datasheetHashes.length, 0);
  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-start">
      <div className="ms-2 me-auto">
        <div className="fw-bold">
          {group.variants[0]?.manName}
          {group.trusted && (
            <Badge bg="success" className="ms-2">
              <FontAwesomeIcon icon={faCheck} className="me-1" />
              Trusted
            </Badge>
          )}
        </div>
        {group.variants.length > 1 && (
          <div className="text-muted small">
            Also known as:{' '}
            {group.variants
              .slice(1)
              .map((v) => v.manName)
              .join(', ')}
          </div>
        )}
      </div>
      <Badge bg="secondary" pill title="Total Assigned Datasheets">
        {totalDatasheetHashes}
      </Badge>
    </ListGroup.Item>
  );
};

export default ManMatch;
