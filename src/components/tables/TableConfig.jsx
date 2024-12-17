import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faXmark } from '@fortawesome/pro-solid-svg-icons';
import ColumnVisibilityToggle from './ColumnVisibilityToggle';

const TableConfig = ({
  table,
  globalFilter,
  setGlobalFilter,
  columnVisibility,
  onColumnVisibilityChange,
  title,
  totalCount,
  isServerSide = false,
}) => {
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (isServerSide) {
      setGlobalFilter(value);
    } else {
      table.setGlobalFilter(value);
    }
  };

  const handleClearSearch = () => {
    if (isServerSide) {
      setGlobalFilter('');
    } else {
      table.setGlobalFilter('');
    }
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5>
        {title} {totalCount !== undefined && `(${totalCount})`}
      </h5>
      <div className="d-flex align-items-center gap-2">
        <InputGroup style={{ width: '300px' }}>
          <InputGroup.Text>
            <FontAwesomeIcon icon={faSearch} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search records..."
            value={isServerSide ? globalFilter : table.getState().globalFilter ?? ''}
            onChange={handleSearchChange}
            style={{ paddingRight: '30px' }}
          />
          {(isServerSide ? globalFilter : table.getState().globalFilter) && (
            <div
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                cursor: 'pointer',
              }}
              onClick={handleClearSearch}
            >
              <FontAwesomeIcon icon={faXmark} className="text-danger" />
            </div>
          )}
        </InputGroup>
        <ColumnVisibilityToggle
          columns={table.getAllLeafColumns()}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
      </div>
    </div>
  );
};

export default TableConfig;
