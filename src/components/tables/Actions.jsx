import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/pro-solid-svg-icons';
import { usePatch } from '../../hooks/usePatch';

const Actions = ({ row }) => {
  const { patchData, isLoading } = usePatch();

  const handleAddToQueue = async (docType) => {
    try {
      const response = await patchData(`/fulfill/status/update/queue/${docType}/${row._id}`);
      if (response.success) {
        // TODO: Add toast notification or other feedback
        console.log('Record queued successfully');
      }
    } catch (error) {
      console.error('Error queueing record:', error);
      // TODO: Add error notification
    }
  };

  return (
    <div className="d-flex gap-2 justify-content-center">
      {row.docType && (
        <Button variant="outline-primary" size="sm" onClick={() => handleAddToQueue(row.docType)} disabled={isLoading} title="Add to Queue">
          <FontAwesomeIcon icon={faArrowLeft} />
        </Button>
      )}
    </div>
  );
};

export default Actions;
