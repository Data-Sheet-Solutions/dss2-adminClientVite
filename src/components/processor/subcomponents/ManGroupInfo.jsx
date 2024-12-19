import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { useGet } from '../../../hooks/useGet';
import ManMatch from './ManMatch';

const ManGroupInfo = ({ manName }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const { getData } = useGet();

  useEffect(() => {
    const searchManGroups = async () => {
      if (!manName) return;

      setIsSearching(true);
      setError(null);

      try {
        const response = await getData(`/fulfill/manufacturers/search?manName=${encodeURIComponent(manName)}`);
        setSearchResults(response.matches || []);
      } catch (err) {
        console.error('Error searching manufacturer groups:', err);
        setError(err.message || 'Failed to search manufacturer groups');
      } finally {
        setIsSearching(false);
      }
    };

    searchManGroups();
  }, [manName, getData]);

  if (!manName) {
    return (
      <Card>
        <Card.Body className="text-center text-muted">No manufacturer name provided</Card.Body>
      </Card>
    );
  }

  if (isSearching) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Spinner animation="border" role="status" size="sm" className="me-2" />
          Searching manufacturer groups...
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Body className="text-danger">Error: {error}</Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>Manufacturer Group Matches</span>
        <Badge bg="primary">{searchResults.length}</Badge>
      </Card.Header>
      <ListGroup variant="flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {searchResults.length === 0 ? (
          <ListGroup.Item className="text-muted">No matching manufacturer groups found</ListGroup.Item>
        ) : (
          searchResults.map((group) => <ManMatch key={group._id} group={group} />)
        )}
      </ListGroup>
    </Card>
  );
};

export default ManGroupInfo;
