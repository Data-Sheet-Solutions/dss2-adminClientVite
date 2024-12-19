import React from 'react';
import { InputGroup, Form, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSave } from '@fortawesome/pro-solid-svg-icons';

const RecordInfo = ({ record }) => {
  if (!record) return null;

  // Extract data from the correct path in the record object
  const productIdentifier = record.canonicalProperties?.productIdentifier || record.productIdentifier;
  const manName = record.canonicalProperties?.manName || record.manName;
  const aka = record.canonicalProperties?.aka || [];
  const upc = record.canonicalProperties?.upc || [];

  const handleSearch = (type, value) => {
    if (!value) return;

    // Construct search query based on type
    let searchQuery = value;
    if (type === 'manufacturer') {
      searchQuery = `${value} manufacturer safety data sheet`;
    } else if (type === 'productId') {
      searchQuery = `${value} ${manName || ''} sds`;
    }

    // Encode the search query and open in new tab
    const encodedQuery = encodeURIComponent(searchQuery);
    const searchUrl = `https://www.google.com/search?q=${encodedQuery}`;
    window.open(searchUrl, '_blank');
  };

  const handleSave = (type, value) => {
    // TODO: Implement save functionality
    console.log(`Saving ${type}:`, value);
  };

  return (
    <div className="record-info">
      <InputGroup className="mb-3">
        <Form.Control value={productIdentifier || ''} readOnly placeholder="No product identifier" />
        <Button variant="outline-secondary" onClick={() => handleSearch('productId', productIdentifier)} disabled={!productIdentifier}>
          <FontAwesomeIcon icon={faSearch} />
        </Button>
        <Button variant="outline-secondary" onClick={() => handleSave('productId', productIdentifier)} disabled={!productIdentifier}>
          <FontAwesomeIcon icon={faSave} />
        </Button>
      </InputGroup>

      <InputGroup className="mb-3">
        <Form.Control value={manName || ''} readOnly placeholder="No manufacturer name" />
        <Button variant="outline-secondary" onClick={() => handleSearch('manufacturer', manName)} disabled={!manName}>
          <FontAwesomeIcon icon={faSearch} />
        </Button>
        <Button variant="outline-secondary" onClick={() => handleSave('manufacturer', manName)} disabled={!manName}>
          <FontAwesomeIcon icon={faSave} />
        </Button>
      </InputGroup>

      {aka.length > 0 && (
        <div className="mb-2">
          {aka.map((alias, index) => (
            <Badge key={index} bg="secondary" className="me-1 mb-1">
              {alias}
            </Badge>
          ))}
        </div>
      )}

      {upc.length > 0 && (
        <div>
          {upc.map((code, index) => (
            <Badge key={index} bg="info" className="me-1 mb-1">
              {code}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordInfo;
