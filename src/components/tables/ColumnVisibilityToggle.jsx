import React, { useState, useEffect, useRef } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListCheck } from '@fortawesome/pro-solid-svg-icons';

const ColumnVisibilityToggle = ({ columns, columnVisibility, onColumnVisibilityChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const closeTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (showDropdown) {
      closeTimeoutRef.current = setTimeout(() => {
        setShowDropdown(false);
      }, 500);
    }
  };

  const toggleColumnVisibility = (columnId, e) => {
    e.stopPropagation();
    const currentVisibility = columnVisibility[columnId] !== false;
    const newVisibility = {
      ...columnVisibility,
      [columnId]: !currentVisibility,
    };
    onColumnVisibilityChange(newVisibility);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Dropdown
      style={{ zIndex: 1050 }}
      show={showDropdown}
      onToggle={(isOpen, event, metadata = {}) => {
        if (metadata?.source === 'rootClose' && !isHovering) {
          setShowDropdown(false);
        } else if (metadata?.source === 'click') {
          setShowDropdown(!showDropdown);
        }
      }}
    >
      <Dropdown.Toggle variant="secondary" id="dropdown-column-visibility" onClick={() => setShowDropdown((prev) => !prev)}>
        <FontAwesomeIcon icon={faListCheck} /> Columns
      </Dropdown.Toggle>
      <Dropdown.Menu onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ minWidth: '200px' }}>
        {columns
          .filter((column) => column.id !== 'select' && column.getCanHide())
          .map((column) => {
            const isVisible = columnVisibility[column.id] !== false;
            return (
              <Dropdown.Item
                key={column.id}
                as="div"
                className="px-3 py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleColumnVisibility(column.id, e);
                }}
                style={{ cursor: 'pointer' }}
              >
                <Form.Check
                  type="checkbox"
                  id={`column-toggle-${column.id}`}
                  checked={isVisible}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleColumnVisibility(column.id, e);
                  }}
                  label={column.columnDef.header || column.id}
                  className="m-0"
                  onClick={(e) => e.stopPropagation()}
                  style={{ pointerEvents: 'none' }}
                />
              </Dropdown.Item>
            );
          })}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ColumnVisibilityToggle;
