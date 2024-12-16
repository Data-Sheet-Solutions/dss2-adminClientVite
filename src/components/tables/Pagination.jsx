import React from 'react';
import { Pagination, DropdownButton, Dropdown } from 'react-bootstrap';

const PaginationComponent = ({ currentPage, totalPages, onPageChange, previousPage, nextPage, pageSize, totalEntries, onPageSizeChange }) => {
  const getPaginationButtons = (currentPage, totalPages) => {
    const buttons = [];
    const maxButtons = 7;

    buttons.push({ type: 'prev', page: currentPage - 1, disabled: currentPage === 1 });

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push({ type: 'page', page: i, active: i === currentPage });
      }
    } else {
      buttons.push({ type: 'page', page: 1, active: 1 === currentPage });

      if (currentPage > 3) {
        buttons.push({ type: 'ellipsis' });
      }

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (start === 2) end = 4;
      if (end === totalPages - 1) start = totalPages - 3;

      for (let i = start; i <= end; i++) {
        buttons.push({ type: 'page', page: i, active: i === currentPage });
      }

      if (currentPage < totalPages - 2) {
        buttons.push({ type: 'ellipsis' });
      }

      buttons.push({ type: 'page', page: totalPages, active: totalPages === currentPage });
    }

    buttons.push({ type: 'next', page: currentPage + 1, disabled: currentPage === totalPages });

    return buttons;
  };

  const paginationButtons = getPaginationButtons(currentPage, totalPages);
  const startEntry = (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalEntries);

  return (
    <div className="d-flex justify-content-between align-items-center p-3 bg-white border-top">
      <div className="d-flex align-items-center">
        <span>
          Showing {startEntry} to {endEntry} of {totalEntries} entries
        </span>
        <DropdownButton title={`${pageSize} per page`} variant="outline-secondary" size="sm" className="ms-2">
          {[10, 20, 50, 100].map((size) => (
            <Dropdown.Item key={size} onClick={() => onPageSizeChange(size)} active={pageSize === size}>
              {size} per page
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </div>

      <Pagination className="mb-0">
        {paginationButtons.map((button, index) => {
          if (button.type === 'prev') {
            return <Pagination.Prev key={index} onClick={previousPage} disabled={button.disabled} />;
          }
          if (button.type === 'next') {
            return <Pagination.Next key={index} onClick={nextPage} disabled={button.disabled} />;
          }
          if (button.type === 'ellipsis') {
            return <Pagination.Ellipsis key={index} disabled />;
          }
          return (
            <Pagination.Item key={index} active={button.active} onClick={() => onPageChange(button.page - 1)}>
              {button.page}
            </Pagination.Item>
          );
        })}
      </Pagination>
    </div>
  );
};

export default PaginationComponent;
