import React, { useState, useEffect, useRef } from 'react';
import { ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTrash, fa2 } from '@fortawesome/pro-solid-svg-icons';
import { usePatch } from '../../hooks/usePatch';
import { useNavigate } from 'react-router-dom';

function QueueItem({ item, onRemove }) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const contextMenuRef = useRef(null);
  const timeoutRef = useRef(null);
  const listItemVariant = item.recordId ? 'warning' : undefined;
  const { patchData } = usePatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showContextMenu && !isHovering) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setShowContextMenu(false);
      }, 1000);
    } else if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showContextMenu, isHovering]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
    setIsHovering(true);
  };

  const handleClick = () => {
    navigate(`/home/processor/${item.docType}/${item._id}`);
  };

  const handleAction = async (action) => {
    setShowContextMenu(false);

    if (action === 'dequeue') {
      try {
        await patchData(`/fulfill/status/update/dequeue/${item.docType}/${item._id}`);
        console.log('Successfully dequeued item:', item._id);
        // Instantly remove from DOM
        onRemove(item._id);
      } catch (error) {
        console.error('Error dequeuing item:', error);
      }
    } else {
      console.log(`Action ${action} clicked for item:`, item);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <>
      <ListGroup.Item className={`p-1`} variant={listItemVariant} action onContextMenu={handleContextMenu} onClick={handleClick}>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="fw-bold">{item.productIdentifier}</div>
            <div className="text-muted small">{item.manName}</div>
          </div>
        </div>
      </ListGroup.Item>

      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="position-fixed bg-white rounded shadow-sm d-flex"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            zIndex: 1050,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className="btn btn-link text-primary p-2" onClick={() => handleAction('dequeue')} title="Remove from queue">
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
          <button className="btn btn-link text-danger p-2" onClick={() => handleAction('delete')} title="Delete">
            <FontAwesomeIcon icon={faTrash} />
          </button>
          <button className="btn btn-link text-secondary p-2" onClick={() => handleAction('tierTwo')} title="Send to Tier 2">
            <FontAwesomeIcon icon={fa2} />
          </button>
        </div>
      )}
    </>
  );
}

export default QueueItem;
