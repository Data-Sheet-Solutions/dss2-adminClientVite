import React, { useState, useEffect, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { Table } from 'react-bootstrap';
import { getClientColumnDefinitions } from './clientColumnDefinitions';
import TableConfig from './TableConfig';
import TableHeader from './TableHeader';
import PaginationComponent from './Pagination';
import { useGet } from '../../hooks/useGet';
import Cookies from 'js-cookie';

const ClientsTable = () => {
  // State management
  const [data, setData] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const { getData, isLoading, error } = useGet();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData('/fulfill/clients');
        setData(response.clients);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };

    fetchData();
  }, []);

  // Column definitions
  const columns = useMemo(() => getClientColumnDefinitions(), []);

  // Initialize column visibility from cookies
  useEffect(() => {
    const savedVisibility = Cookies.get('clients_columnVisibility');
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
    },
    onColumnVisibilityChange: (updater) => {
      const newVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
      setColumnVisibility(newVisibility);
      Cookies.set('clients_columnVisibility', JSON.stringify(newVisibility), { expires: 365 });
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (error) {
    return <div className="alert alert-danger">Error loading clients: {error.message}</div>;
  }

  return (
    <div className="d-flex flex-column h-100">
      <TableConfig
        table={table}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        title="Clients"
        totalCount={data.length}
        isServerSide={false}
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

export default ClientsTable;
