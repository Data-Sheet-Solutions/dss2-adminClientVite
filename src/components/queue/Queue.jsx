import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/pro-solid-svg-icons';

const COOKIE_NAME = 'queuePaneWidth';
const MIN_WIDTH = 200;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 300;

function Queue() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(() => {
    const savedWidth = Cookies.get(COOKIE_NAME);
    return savedWidth ? parseInt(savedWidth) : DEFAULT_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);

  useEffect(() => {
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

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
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
      <div className="queue-content p-3" style={{ display: isCollapsed ? 'none' : 'block' }}>
        <h4>Queue</h4>
        {/* Add your queue content here */}
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
