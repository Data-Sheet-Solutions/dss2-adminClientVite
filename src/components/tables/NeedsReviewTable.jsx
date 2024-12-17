import React, { useState, useEffect, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { Table } from 'react-bootstrap';
import { getNeedsReviewColumnDefinitions } from './needsReviewColumnDefinitions';
import TableConfig from './TableConfig';
import TableHeader from './TableHeader';
import PaginationComponent from './Pagination';
import FilterableCell from './FilterableCell';
import Cookies from 'js-cookie';

const NeedsReviewTable = ({ data = [], isLoading, error, searchString, onUpdate }) => {
  // State management
  const [columnVisibility, setColumnVisibility] = useState({});
  const [globalFilter, setGlobalFilter] = useState(searchString || '');
  const [rowSelection, setRowSelection] = useState({});

  // Update globalFilter when searchString prop changes
  useEffect(() => {
    setGlobalFilter(searchString || '');
  }, [searchString]);

  // Column definitions with setGlobalFilter
  const columns = useMemo(() => {
    const handleFilter = (value) => {
      setGlobalFilter(value);
      onUpdate?.(value);
    };
    return getNeedsReviewColumnDefinitions(handleFilter);
  }, [onUpdate]);

  // Initialize column visibility from cookies
  useEffect(() => {
    const savedVisibility = Cookies.get('needsReview_columnVisibility');
    if (savedVisibility) {
      try {
        setColumnVisibility(JSON.parse(savedVisibility));
      } catch (error) {
        console.error('Error parsing column visibility cookie:', error);
        const defaultVisibility = {};
        columns.forEach((col) => {
          defaultVisibility[col.id] = col.defaultVisible ?? true;
        });
        setColumnVisibility(defaultVisibility);
      }
    } else {
      const defaultVisibility = {};
      columns.forEach((col) => {
        defaultVisibility[col.id] = col.defaultVisible ?? true;
      });
      setColumnVisibility(defaultVisibility);
    }
  }, [columns]);

  // Table instance
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    state: {
      columnVisibility,
      globalFilter,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: (updater) => {
      const newVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
      setColumnVisibility(newVisibility);
      Cookies.set('needsReview_columnVisibility', JSON.stringify(newVisibility), { expires: 365 });
    },
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
      onUpdate?.(value);
    },
    enableGlobalFilter: true,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (error) {
    return <div className="alert alert-danger">Error loading needs review records: {error.message}</div>;
  }

  return (
    <div className="d-flex flex-column h-100">
      <TableConfig
        table={table}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        title="Needs Review Records"
        totalCount={(data || []).length}
        isServerSide={false}
        globalFilter={globalFilter}
        setGlobalFilter={(value) => {
          setGlobalFilter(value);
          onUpdate?.(value);
        }}
      />

      <div className="flex-grow-1 overflow-auto">
        <Table striped bordered hover>
          <TableHeader headerGroups={table.getHeaderGroups()} isServerSide={false} />
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={table.getAllColumns().length} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <div className="mt-auto">
        <PaginationComponent table={table} isServerSide={false} />
      </div>
    </div>
  );
};

export default NeedsReviewTable;
