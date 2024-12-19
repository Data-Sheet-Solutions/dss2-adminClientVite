import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/pro-solid-svg-icons';
import { useGet } from '../../hooks/useGet';
import RecordInfo from './subcomponents/RecordInfo';
import ManGroupInfo from './subcomponents/ManGroupInfo';
import DatasheetSearch from './subcomponents/DatasheetSearch';
import PdfPreview from './subcomponents/PdfPreview';

function Processor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { type, id } = useParams();
  const { getData } = useGet();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let response;
        if (type === 'record') {
          response = await getData(`/fulfill/record/${id}`);
        } else if (type === 'revTree') {
          response = await getData(`/fulfill/revision/${id}`);
        }
        setData(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (type && id) {
      fetchData();
    }
  }, [type, id, getData]);

  const handleClose = () => {
    // Get the last path segment before /processor
    const previousPath = location.pathname.split('/').slice(0, -3).join('/');

    // Navigate back to the previous route, defaulting to /home/active if no previous route
    navigate(previousPath || '/home/active');
  };

  return (
    <Container fluid className="h-100 p-0 position-relative">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="btn btn-link position-absolute"
        style={{
          top: '10px',
          right: '10px',
          zIndex: 1050,
          fontSize: '1.5rem',
          color: '#6c757d',
          padding: '0.25rem',
          lineHeight: 1,
        }}
        title="Close processor"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>

      <Row className="g-3 p-3">
        <Col md={8}>
          <Card>
            <Card.Header>Record Information</Card.Header>
            <Card.Body>
              <RecordInfo record={data} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>Client & Requestor Info</Card.Header>
            <Card.Body>{/* Client info will go here */}</Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <ManGroupInfo manName={data?.canonicalProperties?.manName} />
          {data?.canonicalProperties?.fileHash && (
            <Card className="mt-3">
              <Card.Header>Safety Data Sheet</Card.Header>
              <Card.Body className="p-0">
                <PdfPreview
                  fileHash={data.canonicalProperties.fileHash}
                  searchTerms={{
                    productIdentifier: data.canonicalProperties.productIdentifier,
                    manName: data.canonicalProperties.manName,
                    aka: data.canonicalProperties.aka,
                  }}
                />
              </Card.Body>
            </Card>
          )}
        </Col>
        <Col md={8}>
          <DatasheetSearch
            productIdentifier={data?.canonicalProperties?.productIdentifier}
            manName={data?.canonicalProperties?.manName}
            aka={data?.canonicalProperties?.aka}
            upc={data?.canonicalProperties?.upc}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default Processor;
