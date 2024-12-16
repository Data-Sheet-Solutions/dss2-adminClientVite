import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faXmark } from '@fortawesome/pro-solid-svg-icons';
import ColumnVisibilityToggle from './ColumnVisibilityToggle';

const TableConfig = ({ table, globalFilter, setGlobalFilter, columnVisibility, onColumnVisibilityChange, title, totalCount }) => {
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
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            style={{ paddingRight: '30px' }}
          />
          {globalFilter && (
            <div
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                cursor: 'pointer',
              }}
              onClick={() => setGlobalFilter('')}
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
