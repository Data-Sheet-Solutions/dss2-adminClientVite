import React from 'react';
import { flexRender } from '@tanstack/react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/pro-solid-svg-icons';

const TableHeader = ({ headerGroups, isServerSide = false }) => {
  const handleSortClick = (header, e) => {
    const isSortable = header.column.columnDef.enableSorting !== false && header.column.getCanSort();
    const sortHandler = isSortable ? header.column.getToggleSortingHandler() : undefined;

    if (isSortable && sortHandler) {
      e.preventDefault();
      e.stopPropagation();
      sortHandler(e);
    }
  };

  return (
    <thead className="sticky-top" style={{ boxShadow: '#b0aeae 0px -1px 15px 0px', zIndex: 1 }}>
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const isSortable = header.column.columnDef.enableSorting !== false && header.column.getCanSort();
            const sortDirection = header.column.getIsSorted();

            return (
              <th
                key={header.id}
                className="align-middle"
                style={{
                  textAlign: header.column.columnDef.meta?.align || header.column.columnDef.textAlign || 'left',
                  cursor: isSortable ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
                onClick={(e) => handleSortClick(header, e)}
              >
                <div className="d-flex align-items-center justify-content-between">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  {isSortable && (
                    <span className="ms-2">
                      {sortDirection === 'asc' && <FontAwesomeIcon icon={faSortUp} className="text-primary" />}
                      {sortDirection === 'desc' && <FontAwesomeIcon icon={faSortDown} className="text-primary" />}
                      {!sortDirection && <FontAwesomeIcon icon={faSort} className="text-secondary" />}
                    </span>
                  )}
                </div>
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
};

export default TableHeader;
