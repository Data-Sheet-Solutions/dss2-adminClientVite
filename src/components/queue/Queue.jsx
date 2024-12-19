import React, { useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faSpinner, faArrowRightFromBracket, faArrowDownAZ } from '@fortawesome/pro-solid-svg-icons';
import { ListGroup, Badge } from 'react-bootstrap';
import QueueItem from './QueueItem';
import { usePatch } from '../../hooks/usePatch';

const COOKIE_NAME = 'queuePaneWidth';
const MIN_WIDTH = 200;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 300;

function Queue({ items = [], isLoading = false, error = null, onItemRemoved }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(() => {
    const savedWidth = Cookies.get(COOKIE_NAME);
    return savedWidth ? parseInt(savedWidth) : DEFAULT_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [localItems, setLocalItems] = useState([]);
  const [isDequeueingAll, setIsDequeueingAll] = useState(false);
  const [sortByName, setSortByName] = useState(() => {
    return Cookies.get('queueSortByName') === 'true';
  });
  const resizeRef = useRef(null);
  const { patchData } = usePatch();

  // Update and sort local items when props change
  React.useEffect(() => {
    const sortedItems = [...items].sort((a, b) => {
      if (sortByName) {
        return (a.manName || '').localeCompare(b.manName || '');
      }
      const timeA = new Date(a.fulfillment?.queuedAt).getTime();
      const timeB = new Date(b.fulfillment?.queuedAt).getTime();
      return timeA - timeB;
    });
    setLocalItems(sortedItems);
  }, [items, sortByName]);

  const toggleSortOrder = () => {
    const newSortByName = !sortByName;
    setSortByName(newSortByName);
    Cookies.set('queueSortByName', newSortByName.toString(), { expires: 365 });
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;

    const newWidth = e.clientX;
    if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
      setWidth(newWidth);
      Cookies.set(COOKIE_NAME, newWidth.toString());
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleRemoveItem = (itemId) => {
    setLocalItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
    if (onItemRemoved) {
      onItemRemoved(itemId);
    }
  };

  const handleDequeueAll = async () => {
    if (isDequeueingAll || !localItems.length) return;

    setIsDequeueingAll(true);
    try {
      for (const item of localItems) {
        try {
          await patchData(`/fulfill/status/update/dequeue/${item.docType}/${item._id}`);
          handleRemoveItem(item._id);
        } catch (error) {
          console.error(`Error dequeuing item ${item._id}:`, error);
        }
      }
    } finally {
      setIsDequeueingAll(false);
    }
  };

  return (
    <div
      className="queue-container"
      style={{
        width: isCollapsed ? '40px' : `${width}px`,
        minWidth: isCollapsed ? '40px' : `${MIN_WIDTH}px`,
        maxWidth: `${MAX_WIDTH}px`,
        height: '100%',
        position: 'relative',
        transition: isResizing ? 'none' : 'width 0.3s ease',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
      }}
    >
      {/* Queue Content */}
      <div className="queue-content" style={{ display: isCollapsed ? 'none' : 'block' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">
            Queue
            <Badge bg="secondary" className="ms-2">
              {localItems.length}
            </Badge>
          </h4>
          <div className="d-flex gap-2">
            {localItems.length > 0 && (
              <>
                <button
                  className={`btn btn-link p-0 ${sortByName ? 'text-primary' : 'text-secondary'}`}
                  onClick={toggleSortOrder}
                  title={sortByName ? 'Sorting by manufacturer name' : 'Sorting by queue time'}
                >
                  <FontAwesomeIcon icon={faArrowDownAZ} />
                </button>
                <button className="btn btn-link text-secondary p-0" onClick={handleDequeueAll} disabled={isDequeueingAll} title="Dequeue all items">
                  <FontAwesomeIcon icon={isDequeueingAll ? faSpinner : faArrowRightFromBracket} spin={isDequeueingAll} />
                </button>
              </>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-3">
            <FontAwesomeIcon icon={faSpinner} spin />
            <div className="mt-2">Loading queue...</div>
          </div>
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : localItems.length === 0 ? (
          <div className="text-muted">No items in queue</div>
        ) : (
          <ListGroup variant="flush" className="queue-items" style={{ fontSize: '0.9rem' }}>
            {localItems.map((item) => (
              <QueueItem key={item._id} item={item} onRemove={handleRemoveItem} />
            ))}
          </ListGroup>
        )}
      </div>

      {/* Collapse/Expand Button */}
      <button
        onClick={toggleCollapse}
        className="collapse-button"
        style={{
          position: 'absolute',
          right: isCollapsed ? '0' : '-20px',
          top: '20px',
          width: '20px',
          height: '40px',
          border: 'none',
          borderRadius: '0 4px 4px 0',
          backgroundColor: '#dee2e6',
          cursor: 'pointer',
          zIndex: 1000,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FontAwesomeIcon
          icon={faChevronRight}
          style={{
            transform: isCollapsed ? 'none' : 'rotate(180deg)',
            transition: 'transform 0.3s ease',
          }}
        />
      </button>

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          ref={resizeRef}
          onMouseDown={handleResizeStart}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '5px',
            height: '100%',
            cursor: 'ew-resize',
            backgroundColor: 'transparent',
          }}
        />
      )}
    </div>
  );
}

export default Queue;
