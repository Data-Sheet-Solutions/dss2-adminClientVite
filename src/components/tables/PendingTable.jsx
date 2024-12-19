import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { Table, Form } from 'react-bootstrap';
import TableConfig from './TableConfig';
import TableHeader from './TableHeader';
import PaginationComponent from './Pagination';
import FilterableCell from './FilterableCell';
import Actions from './Actions';
import Cookies from 'js-cookie';

// Column definitions for all tables
const getColumns = (lastSelectedIndex, setLastSelectedIndex, setGlobalFilter) => [
  {
    id: 'select',
    header: ({ table }) => (
      <Form.Check
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row, table }) => (
      <Form.Check
        type="checkbox"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        indeterminate={row.getIsSomeSelected()}
        onChange={(e) => {
          if (e.nativeEvent.shiftKey && lastSelectedIndex !== null) {
            const currentIndex = row.index;
            const start = Math.min(lastSelectedIndex, currentIndex);
            const end = Math.max(lastSelectedIndex, currentIndex);

            const rowsToSelect = table
              .getRowModel()
              .rows.slice(start, end + 1)
              .map((row) => row.id);

            const newSelection = { ...table.getState().rowSelection };
            rowsToSelect.forEach((id) => {
              newSelection[id] = true;
            });

            table.setRowSelection(newSelection);
          } else {
            row.toggleSelected();
          }
          setLastSelectedIndex(row.index);
        }}
      />
    ),
    enableSorting: false,
    enableFiltering: false,
    defaultVisible: true,
  },
  {
    id: 'recordId',
    header: 'Record ID',
    accessorKey: 'recordId',
    enableSorting: true,
    enableFiltering: true,
    defaultVisible: true,
  },
  {
    id: 'productIdentifier',
    header: 'Product ID',
    accessorKey: 'productIdentifier',
    enableSorting: true,
    enableFiltering: true,
    defaultVisible: true,
  },
  {
    id: 'manName',
    header: 'Manufacturer',
    accessorKey: 'manName',
    enableSorting: true,
    enableFiltering: true,
    defaultVisible: true,
    cell: ({ getValue }) => <FilterableCell value={getValue()} onFilter={setGlobalFilter} />,
  },
  {
    id: 'aka',
    header: 'AKA',
    accessorKey: 'aka',
    enableSorting: true,
    enableFiltering: true,
    defaultVisible: false,
  },
  {
    id: 'upc',
    header: 'UPC',
    accessorKey: 'upc',
    enableSorting: true,
    enableFiltering: true,
    defaultVisible: false,
  },
  {
    id: 'clientName',
    header: 'Client',
    accessorKey: 'clientName',
    enableSorting: true,
    enableFiltering: true,
    defaultVisible: true,
    cell: ({ getValue }) => <FilterableCell value={getValue()} onFilter={setGlobalFilter} />,
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    enableSorting: true,
    defaultVisible: true,
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <Actions row={row.original} />,
    enableSorting: false,
    enableFiltering: false,
    defaultVisible: true,
  },
];

const PendingTableContent = ({ data, isLoading, error, searchString, onUpdate }) => {
  const { option } = useParams();
  const [columnVisibility, setColumnVisibility] = useState({});
  const [globalFilter, setGlobalFilter] = useState(searchString || '');
  const [rowSelection, setRowSelection] = useState({});
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  // Update globalFilter when searchString prop changes
  useEffect(() => {
    setGlobalFilter(searchString || '');
  }, [searchString]);

  // Column definitions
  const columns = useMemo(
    () =>
      getColumns(lastSelectedIndex, setLastSelectedIndex, (value) => {
        setGlobalFilter(value);
        onUpdate?.(value);
      }),
    [lastSelectedIndex, onUpdate]
  );

  // Initialize column visibility from cookies
  useEffect(() => {
    const savedVisibility = Cookies.get(`pending${option}_columnVisibility`);
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
  }, [columns, option]);

  // Reset selection when switching tables
  useEffect(() => {
    setRowSelection({});
    setLastSelectedIndex(null);
  }, [option]);

  // Table instance
  const table = useReactTable({
    data: data,
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
      Cookies.set(`pending${option}_columnVisibility`, JSON.stringify(newVisibility), { expires: 365 });
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
    return <div className="alert alert-danger">Error loading pending records: {error.message}</div>;
  }

  const getTableTitle = () => {
    switch (option) {
      case '1':
        return 'Pending Records - No FileHash';
      case '2':
        return 'Pending Records - With FileHash';
      case '3':
        return 'Active Records - Untrusted Source';
      default:
        return 'Pending Records';
    }
  };

  return (
    <div className="d-flex flex-column h-100">
      <TableConfig
        table={table}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        title={getTableTitle()}
        totalCount={data.length}
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

const PendingTable = ({ pendingData, isLoading, error, searchString, onUpdate }) => {
  return (
    <Routes>
      <Route
        path="1"
        element={
          <PendingTableContent data={pendingData.option1} isLoading={isLoading} error={error} searchString={searchString} onUpdate={onUpdate} />
        }
      />
      <Route
        path="2"
        element={
          <PendingTableContent data={pendingData.option2} isLoading={isLoading} error={error} searchString={searchString} onUpdate={onUpdate} />
        }
      />
      <Route
        path="3"
        element={
          <PendingTableContent data={pendingData.option3} isLoading={isLoading} error={error} searchString={searchString} onUpdate={onUpdate} />
        }
      />
      <Route path="*" element={<Navigate to="1" replace />} />
    </Routes>
  );
};

export default PendingTable;
