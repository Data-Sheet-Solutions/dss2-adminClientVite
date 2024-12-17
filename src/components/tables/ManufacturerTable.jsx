import React, { useState, useEffect, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { Table } from 'react-bootstrap';
import { getManufacturerColumnDefinitions } from './manufacturerColumnDefinitions';
import TableConfig from './TableConfig';
import TableHeader from './TableHeader';
import PaginationComponent from './Pagination';
import { useGet } from '../../hooks/useGet';
import Cookies from 'js-cookie';

const ManufacturerTable = () => {
  // State management
  const [data, setData] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const { getData, isLoading, error } = useGet();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData('/fulfill/manufacturers');
        setData(response.manufacturers);
      } catch (err) {
        console.error('Error fetching manufacturers:', err);
      }
    };

    fetchData();
  }, []);

  // Column definitions
  const columns = useMemo(() => getManufacturerColumnDefinitions(), []);

  // Initialize column visibility from cookies
  useEffect(() => {
    const savedVisibility = Cookies.get('manufacturers_columnVisibility');
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
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnVisibility,
      globalFilter,
    },
    onColumnVisibilityChange: (updater) => {
      const newVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
      setColumnVisibility(newVisibility);
      Cookies.set('manufacturers_columnVisibility', JSON.stringify(newVisibility), { expires: 365 });
    },
    onGlobalFilterChange: setGlobalFilter,
    enableGlobalFilter: true,
    getColumnCanGlobalFilter: (column) => column.columnDef.enableFiltering === true,
    globalFilterFn: (row, columnId, filterValue) => {
      if (columnId !== 'manName') return true;
      const value = row.getValue(columnId);
      if (!value) return false;
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
      sorting: [{ id: 'manName', desc: false }],
    },
  });

  if (error) {
    return <div className="alert alert-danger">Error loading manufacturers: {error.message}</div>;
  }

  return (
    <div className="d-flex flex-column h-100">
      <TableConfig
        table={table}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        title="Manufacturers"
        totalCount={data.length}
        isServerSide={false}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
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

export default ManufacturerTable;
