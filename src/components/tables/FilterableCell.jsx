import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/pro-solid-svg-icons';

const FilterableCell = ({ value, onFilter }) => {
  return (
    <div className="d-flex justify-content-between align-items-center">
      <span>{value}</span>
      {value && (
        <FontAwesomeIcon
          icon={faFilter}
          className="text-success ms-2 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onFilter(value);
          }}
          style={{ cursor: 'pointer' }}
        />
      )}
    </div>
  );
};

export default FilterableCell;
